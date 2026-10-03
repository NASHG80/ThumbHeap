# ThumbHeap — Inference Environment Design

## Why a Separate Environment is Required

The project uses **two different Python environments** for two fundamentally different jobs:

| Environment | Python | Purpose |
|---|---|---|
| `.venv-fusion` | **3.14** | Fusion model training only |
| `.venv-inference` | **3.13** | Live API inference + FastAPI server |

### Root Cause

`.venv-fusion` (Python 3.14) cannot run the live inference pipeline because:

1. **PaddleOCR / PaddlePaddle** does not publish a Python 3.14 wheel on PyPI as of late 2026. The `paddleocr==3.0.0` package used by Person B is only available for Python ≤ 3.13.

2. **TranSalNet_Res.py** imports `from skimage import io, transform` at module-load time. `scikit-image` / `scipy` native DLLs built for Python 3.14 may trigger Windows Application Control policy blocks when installed in `.venv-fusion`.

3. The training environment (`.venv-fusion`) was intentionally locked to PyTorch `2.10.0+cu128` with Python 3.14 to maximise training throughput. Mixing inference packages into it would risk breaking the Fusion training loop.

---

## Environment Responsibilities

### `.venv-fusion` (Python 3.14) — **Training only**

Responsible for:
- `backend/fusion/train.py` — Fusion model training
- `backend/fusion/evaluate.py` — Fusion model evaluation
- `backend/fusion/dataset.py`, `dataloader.py` — OSIE data pipeline
- `backend/scripts/generate_osie_base_heatmaps.py` — TranSalNet batch inference over OSIE (already completed)
- `backend/fusion/generate_visual_comparisons.py` — post-training visualizations

**Does NOT** need to run PaddleOCR, YuNet, or the FastAPI server.

### `.venv-inference` (Python 3.13) — **Live API inference**

Responsible for:
- `backend/api/main.py` — FastAPI server (`/api/analyze`, `/api/upload`, `/auth/*`)
- `backend/api/inference_service.py` — 8-channel inference pipeline
- `backend/api/test_inference_service.py` — smoke-test

Requires all five ML components to be loadable in the **same Python process**:
- TranSalNet-Res (PyTorch)
- FusionNetwork (PyTorch)
- PaddleOCR (PaddlePaddle)
- YuNet (OpenCV)
- YOLO-World-S (ultralytics)

---

## Packages in the Inference Environment

### FastAPI Server
| Package | Reason |
|---|---|
| `fastapi` | HTTP framework |
| `uvicorn[standard]` | ASGI server |
| `python-multipart` | UploadFile form-data support |
| `PyJWT` | JWT auth |
| `bcrypt` | Password hashing |
| `python-dotenv` | `.env` loading |
| `pymongo` | MongoDB connection (reuses existing `main.py` client) |
| `cloudinary` | Cloudinary uploads (reuses existing client) |
| `pydantic` | Request/response models |

### ML Models
| Package | Component | Channel |
|---|---|---|
| `torch`, `torchvision` | TranSalNet-Res + FusionNetwork | ch 0 + fusion |
| `paddlepaddle`, `paddleocr` | PaddleOCR text detection | ch 1 |
| `ultralytics` | YOLO-World-S object detection | ch 3 |
| `opencv-python` | YuNet face detection + all OpenCV maps | ch 2, 4-7 |
| `scikit-image` | TranSalNet module-level import (see note below) | — |
| `scipy` | scikit-image transitive dep | — |

### Supporting
| Package | Reason |
|---|---|
| `numpy` | All array operations |
| `Pillow` | Image I/O |
| `pandas` | Manifest/split reading in tests |
| `matplotlib` | Visualization scripts |

---

## Known TranSalNet Dependency Consideration

**`TranSalNet_Res.py` line 6:**
```python
from skimage import io, transform   # module-level, evaluated at import time
```

This import is **not exercised during runtime inference**. The actual preprocessing
path (`preprocess_img` in `utils/data_process.py`) uses only `cv2` and `numpy`.
However, because Python evaluates all module-level imports when `TranSalNet_Res.py`
is first imported, `scikit-image` (and by extension `scipy`) **must** be installed.

**Windows Application Control risk:** On some Windows configurations, scipy's
native `.pyd` DLLs are blocked by Application Control policy. If this occurs
after installing the inference environment:

1. Try `scipy>=1.13.0,<1.14` which uses an older binary ABI.
2. Or patch `TranSalNet_Res.py` to defer the skimage import:
   ```python
   # Replace line 6 with:
   try:
       from skimage import io, transform
   except ImportError:
       pass  # Not needed for inference-only usage
   ```
   This is safe because `io` and `transform` are only used in the training
   notebook, not in the inference forward pass.

> **Do not apply the patch to `.venv-fusion`** — that environment bypasses the
> issue differently (it uses pre-generated `.npy` base heatmaps and never runs
> TranSalNet live from the training scripts).

---

## GPU / CUDA Setup

- **GPU**: NVIDIA GeForce RTX 5050 Laptop GPU
- **CUDA capability**: `sm_120` (Blackwell architecture)
- **CUDA version**: 12.8
- **Required PyTorch build**: `cu128` index

```bash
# Install PyTorch BEFORE requirements-inference.txt
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128
```

> Standard `pip install torch` will install CPU-only. Always use the `cu128`
> index for this GPU. The `sm_120` architecture requires PyTorch ≥ 2.4.

---

## How the Two Environments Relate

```
Training Flow (offline, one-time):
  .venv-fusion (Python 3.14)
    generate_osie_base_heatmaps.py → 700 .npy files (already done)
    train.py → best_fusion.pth     (already done)
    evaluate.py → metrics          (already done)
                    │
                    ▼   CHECKPOINT HANDOFF
             best_fusion.pth
                    │
                    ▼
Live Inference Flow (per-request):
  .venv-inference (Python 3.13)
    FastAPI /api/analyze
      inference_service.py
        TranSalNet live inference → base_heatmap
        PaddleOCR                 → text_map
        YuNet                     → face_map
        YOLO-World-S              → object_map
        OpenCV                    → brightness/contrast/saturation/edge
        FusionNetwork(best_fusion.pth) → final heatmap
```

The two environments share **only** the trained checkpoint file (`best_fusion.pth`).
They do not share Python packages, virtual environments, or running processes.

---

## Python Version

**Intended version: Python 3.13**

Rationale:
- PaddleOCR 3.0.0 supports Python 3.8–3.13.
- scikit-image 0.24+ supports Python 3.13.
- PyTorch 2.4+ supports Python 3.13.
- ultralytics 8.4+ supports Python 3.13.
- FastAPI 0.111+ supports Python 3.13.

Python 3.13 is the highest version that satisfies all five constraints simultaneously.

---

## Setup Instructions

```bash
# 1. Create the environment
py -3.13 -m venv backend\.venv-inference

# 2. Activate
backend\.venv-inference\Scripts\activate

# 3. Install PyTorch with CUDA 12.8 FIRST
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128

# 4. Install all remaining inference dependencies
pip install -r backend/requirements-inference.txt

# 5. Smoke-test (no FastAPI, no MongoDB, no Cloudinary required)
python backend/api/test_inference_service.py
```

> **Note**: `.venv-fusion` remains untouched. The Fusion training environment
> and the inference environment are fully independent.
