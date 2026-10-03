"""
ThumbHeap ML Inference Service
================================
Loads all models once at module import time (startup).
Exposes run_inference(image_bytes) -> dict for use in the FastAPI route.

Pipeline:
    image_bytes
        -> TranSalNet-Res         -> base_heatmap  (ch 0)
        -> PaddleOCR              -> text_map       (ch 1)
        -> YuNet                  -> face_map       (ch 2)
        -> YOLO-World-S           -> object_map     (ch 3)
        -> OpenCV (HSV-V)         -> brightness_map (ch 4)
        -> OpenCV (local std)     -> contrast_map   (ch 5)
        -> OpenCV (HSV-S)         -> saturation_map (ch 6)
        -> OpenCV (Sobel)         -> edge_map       (ch 7)
        -> stack (1,8,288,384)
        -> FusionNetwork
        -> heatmap (1,1,288,384) clamped [0,1]
        -> overlay image (PNG bytes)
"""

import os
import sys
import io
import tempfile
import logging
from pathlib import Path

# Windows: register System32 in the DLL search path BEFORE any native extension
# module (cv2, torch) is imported. Without this, c10.dll and CUDA runtime DLLs
# fail to initialise in Python 3.13 venvs even when CUDA is installed.
if os.name == "nt":
    os.add_dll_directory(r"C:\Windows\System32")

import cv2
import numpy as np
import torch

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Path Setup
# ──────────────────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent.parent          # .../backend
DETECTION_DIR = BACKEND_DIR / "detection"
TRANSALNET_DIR = BACKEND_DIR / "models" / "transalnet"
FUSION_DIR = BACKEND_DIR / "fusion"
PERSON_C_DIR = BACKEND_DIR / "person_c"

# Make all internal packages importable
for p in [str(BACKEND_DIR), str(DETECTION_DIR), str(TRANSALNET_DIR), str(PERSON_C_DIR / "opencv_features")]:
    if p not in sys.path:
        sys.path.insert(0, p)

# ──────────────────────────────────────────────
# Import local modules
# ──────────────────────────────────────────────
from detection.ocr_easyocr import load_ocr, detect_text_and_map
from detection.yunet import load_yunet, detect_faces_and_map
from detection.yolo_world import load_yolo_world, detect_objects_and_map
from feature_extractor import (
    compute_brightness_map,
    compute_saturation_map,
    compute_contrast_map,
    compute_edge_map,
    normalize_map,
)

# TranSalNet — isolated to this module to keep its path additions contained
from TranSalNet_Res import TranSalNet
from utils.data_process import preprocess_img

# FusionNetwork
sys.path.insert(0, str(FUSION_DIR))
from model import FusionNetwork

# ──────────────────────────────────────────────
# Configuration — read from environment, never hardcoded
# ──────────────────────────────────────────────
TRANSALNET_WEIGHTS = os.getenv(
    "TRANSALNET_WEIGHTS",
    str(TRANSALNET_DIR / "pretrained_models" / "TranSalNet_Res.pth"),
)
FUSION_CHECKPOINT = os.getenv(
    "FUSION_CHECKPOINT",
    str(FUSION_DIR / "checkpoints" / "best_fusion.pth"),
)
OUTPUT_SIZE = (384, 288)   # (width, height) — maps to tensor (288, 384)

# ──────────────────────────────────────────────
# Device — CPU only (matches the original Python 3.8 TranSalNet setup)
# ──────────────────────────────────────────────
device = torch.device("cpu")
logger.info("[InferenceService] Using device: cpu")

# ──────────────────────────────────────────────
# Model Registry — loaded ONCE at startup
# ──────────────────────────────────────────────
_transalnet = None
_fusion_net = None
_ocr_model  = None
_yunet      = None
_yolo       = None


def _load_transalnet():
    if not Path(TRANSALNET_WEIGHTS).exists():
        raise FileNotFoundError(
            f"TranSalNet weights not found: {TRANSALNET_WEIGHTS}. "
            "Set TRANSALNET_WEIGHTS env var or place the file in the expected location."
        )
    # resnet.py uses a hardcoded relative path 'pretrained_models/resnet50-0676ba61.pth'
    # so we must temporarily set CWD to the transalnet directory while loading.
    _orig_cwd = os.getcwd()
    try:
        os.chdir(str(TRANSALNET_DIR))
        m = TranSalNet()
        m.load_state_dict(torch.load(TRANSALNET_WEIGHTS, map_location=device, weights_only=False))
        m.to(device).eval()
    finally:
        os.chdir(_orig_cwd)
    logger.info("[InferenceService] TranSalNet-Res loaded.")
    return m


def _load_fusion():
    if not Path(FUSION_CHECKPOINT).exists():
        raise FileNotFoundError(
            f"Fusion checkpoint not found: {FUSION_CHECKPOINT}. "
            "Set FUSION_CHECKPOINT env var or ensure training has completed."
        )
    m = FusionNetwork()
    ckpt = torch.load(FUSION_CHECKPOINT, map_location=device, weights_only=False)
    m.load_state_dict(ckpt["model_state_dict"])
    m.to(device).eval()
    logger.info("[InferenceService] FusionNetwork loaded.")
    return m


def initialize():
    """
    Call this once at application startup (e.g. in FastAPI lifespan).
    Loads all five ML models into memory.
    """
    global _transalnet, _fusion_net, _ocr_model, _yunet, _yolo
    _transalnet = _load_transalnet()
    _fusion_net = _load_fusion()
    _ocr_model  = load_ocr()
    _yunet      = load_yunet()
    _yolo       = load_yolo_world()
    logger.info("[InferenceService] All models ready.")


# ──────────────────────────────────────────────
# Per-map helpers
# ──────────────────────────────────────────────

def _transalnet_heatmap(img_path: str) -> np.ndarray:
    """
    Runs TranSalNet-Res on a saved image file.
    Returns a float32 array of shape (288, 384) in [0, 1].
    Reuses the exact preprocessing from backend/scripts/test_transalnet.py.
    """
    pil_img = preprocess_img(img_path)                       # PIL → resized
    arr = np.array(pil_img) / 255.0                          # [0,1] float
    arr = np.transpose(arr, (2, 0, 1))                       # (C,H,W)
    arr = np.expand_dims(arr, axis=0)                        # (1,C,H,W)
    t = torch.from_numpy(arr).float().to(device)

    with torch.no_grad():
        pred = _transalnet(t)

    hm = pred.squeeze().cpu().numpy()                        # (H,W) raw
    hm = cv2.resize(hm, OUTPUT_SIZE)                         # → (384×288)
    hm = hm.astype(np.float32)

    # Normalise to [0,1]
    mn, mx = hm.min(), hm.max()
    if mx - mn > 1e-7:
        hm = (hm - mn) / (mx - mn)
    else:
        hm = np.zeros_like(hm, dtype=np.float32)
    return hm


def _opencv_maps(img_bgr: np.ndarray):
    """
    Computes the 4 OpenCV spatial maps using the existing feature_extractor.
    Resizes to OUTPUT_SIZE first so all maps share the same grid.
    Returns brightness, contrast, saturation, edge — each (288, 384) float32.
    """
    resized = cv2.resize(img_bgr, OUTPUT_SIZE, interpolation=cv2.INTER_LINEAR)
    brightness = compute_brightness_map(resized)
    saturation  = compute_saturation_map(resized)
    contrast    = compute_contrast_map(resized)
    edge        = compute_edge_map(resized)
    return brightness, contrast, saturation, edge


def _validate_map(m: np.ndarray, name: str):
    assert m.shape == (288, 384), f"{name}: wrong shape {m.shape}"
    assert m.dtype == np.float32, f"{name}: wrong dtype {m.dtype}"
    assert np.isfinite(m).all(),  f"{name}: contains NaN/Inf"
    assert m.min() >= 0.0 and m.max() <= 1.0001, f"{name}: out of [0,1] range"


def _build_overlay(orig_bgr: np.ndarray, heatmap: np.ndarray) -> bytes:
    """
    Overlays the attention heatmap on the original image, preserving aspect ratio.
    Returns the result as PNG bytes suitable for Cloudinary upload.
    """
    h, w = orig_bgr.shape[:2]
    hm_resized = cv2.resize(heatmap, (w, h))
    hm_8bit    = np.uint8(255 * hm_resized)
    colormap   = cv2.applyColorMap(hm_8bit, cv2.COLORMAP_JET)
    overlay    = cv2.addWeighted(orig_bgr, 0.55, colormap, 0.45, 0)
    _, encoded = cv2.imencode(".png", overlay)
    return encoded.tobytes()


# ──────────────────────────────────────────────
# Main public interface
# ──────────────────────────────────────────────

def run_inference(image_bytes: bytes) -> dict:
    """
    Full inference pipeline for a single uploaded thumbnail.

    Args:
        image_bytes: Raw file bytes of the uploaded image.

    Returns:
        {
            "heatmap_array": np.ndarray (288,384) float32,   # numeric result
            "overlay_png":   bytes,                           # displayable PNG
            "detections": {
                "texts":   int,
                "faces":   int,
                "objects": int,
            }
        }

    Raises:
        ValueError  — invalid / unreadable image
        RuntimeError — model checkpoint missing or inference failure
    """
    if _fusion_net is None:
        raise RuntimeError("Models not initialised. Call initialize() at startup.")

    # ── 1. Decode image ──────────────────────────────────────────────────────
    nparr = np.frombuffer(image_bytes, np.uint8)
    orig_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if orig_bgr is None:
        raise ValueError("Could not decode image. Ensure the file is a valid JPEG/PNG.")

    # ── 2. Write to a temp file (PaddleOCR / YuNet / TranSalNet expect a path) ─
    suffix = ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        tmp.write(image_bytes)

    try:
        # ── 3. Generate all 8 spatial maps ───────────────────────────────────

        # Ch 0: TranSalNet base heatmap
        base_heatmap = _transalnet_heatmap(tmp_path)

        # Ch 1: text_map  (PaddleOCR → text_map.py)
        _, text_map, _, num_texts = detect_text_and_map(tmp_path, _ocr_model)

        # Ch 2: face_map  (YuNet → face_map.py)
        _, face_map, _, num_faces = detect_faces_and_map(tmp_path, _yunet)

        # Ch 3: object_map (YOLO-World → object_map.py)
        _, object_map, _, num_objects = detect_objects_and_map(tmp_path, _yolo)

        # Ch 4-7: OpenCV maps
        brightness_map, contrast_map, saturation_map, edge_map = _opencv_maps(orig_bgr)

    finally:
        # Always clean up the temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    # ── 4. Validate all maps ─────────────────────────────────────────────────
    maps = {
        "base_heatmap":   base_heatmap,
        "text_map":       text_map,
        "face_map":       face_map,
        "object_map":     object_map,
        "brightness_map": brightness_map,
        "contrast_map":   contrast_map,
        "saturation_map": saturation_map,
        "edge_map":       edge_map,
    }
    for name, m in maps.items():
        _validate_map(m, name)

    # ── 5. Stack into (1, 8, 288, 384) tensor ────────────────────────────────
    # Channel order is frozen by the trained Fusion model:
    # 0:base_heatmap  1:text  2:face  3:object
    # 4:brightness    5:contrast  6:saturation  7:edge
    stack = np.stack([
        base_heatmap, text_map, face_map, object_map,
        brightness_map, contrast_map, saturation_map, edge_map,
    ], axis=0)                                             # (8, 288, 384)
    tensor = torch.from_numpy(stack).float().unsqueeze(0).to(device)  # (1,8,288,384)

    # ── 6. FusionNetwork inference ────────────────────────────────────────────
    with torch.no_grad():
        out = _fusion_net(tensor)                           # (1,1,288,384)

    heatmap = out.squeeze().cpu().numpy()                  # (288,384) float32

    # ── 7. Build overlay image ───────────────────────────────────────────────
    overlay_png = _build_overlay(orig_bgr, heatmap)

    return {
        "heatmap_array": heatmap,
        "overlay_png":   overlay_png,
        "detections": {
            "texts":   num_texts,
            "faces":   num_faces,
            "objects": num_objects,
        },
    }
