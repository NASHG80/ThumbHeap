"""
detection/ocr_easyocr.py
=========================
Drop-in replacement for detection/ocr.py that uses EasyOCR instead of PaddleOCR.

Why: PaddleOCR 3.0.0 depends on paddlex → scikit-learn, whose compiled .pyd DLLs
are blocked by Windows Application Control policy on this machine.

EasyOCR uses PyTorch (already installed) and has zero sklearn dependency.
The output format fed to text_map.generate_text_map() is identical.
"""

import sys
from pathlib import Path

current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

import easyocr
from text_map import generate_text_map


def load_ocr():
    """
    Initialises and returns the EasyOCR reader.
    Should be called only once at startup.
    gpu=False — CPU inference, matches original Python 3.8 TranSalNet setup.
    """
    return easyocr.Reader(['en'], gpu=False, verbose=False)


def detect_text_and_map(image_path: str, ocr_model):
    """
    Runs EasyOCR on the image and generates the text_map.
    Returns the same tuple as the original detect_text_and_map:
        success (bool), text_map (ndarray 288x384 float32), result_json (dict), num_texts (int)
    """
    import cv2
    import numpy as np

    img = cv2.imread(str(image_path))
    if img is None:
        raise RuntimeError(f"Could not read image: {image_path}")

    orig_h, orig_w = img.shape[:2]

    # EasyOCR returns: list of (bbox, text, confidence)
    # bbox is [[x1,y1],[x2,y1],[x2,y2],[x1,y2]] — 4-point polygon
    results = ocr_model.readtext(str(image_path))

    raw_detections = []
    for (bbox, text, conf) in results:
        # Normalise bbox to list of [x, y] pairs (same format as PaddleOCR)
        box = [[float(pt[0]), float(pt[1])] for pt in bbox]
        raw_detections.append({
            "text":       text,
            "confidence": float(conf),
            "box":        box,
        })

    num_texts = len(raw_detections)

    # generate_text_map expects the same dict format — fully compatible
    text_map, text_params = generate_text_map(img, raw_detections, output_size=(384, 288))

    assert text_map.shape == (288, 384)
    assert text_map.dtype == np.float32

    result_json = {
        "image_dimensions": {"width": orig_w, "height": orig_h},
        "detections": text_params,
    }

    return True, text_map, result_json, num_texts
