# Person-B Detection Pipeline (Public API for Person C)

This repository contains the unified extraction module designed to produce highly standardized spatial feature maps (Text, Face, Object) directly compatible with Person A's future Fusion Network and Person C's OSIE integration.

## A. Environment Setup
You MUST run this pipeline using the exact Person-B environment to ensure dependency conflicts do not occur. 

## B. Required Dependencies
The guaranteed, tested requirements are recorded strictly in:
`requirements-person-b.txt`

These explicitly lock:
- `paddlepaddle==3.0.0`
- `paddleocr==3.0.0`
- `ultralytics==8.4.171`
- `torch==2.4.1`
- `opencv-python==5.0.0.93`

*(Note: Do not install `opencv-contrib-python` if using Ultralytics, as `opencv-python` versions will shadow it.)*

## C. Model Files Required
You must have the following model weights downloaded into your environment:
- **YuNet:** `backend/models/yunet/face_detection_yunet_2023mar.onnx`
- **YOLO-World-S:** `backend/yolov8s-worldv2.pt` (or auto-downloaded by ultralytics)
- **PaddleOCR v5:** Automatically downloaded to your `.paddlex` directory upon first initialization.

## D. Exact Command to Process an Image Folder (OSIE)

**WARNING:** DO NOT COMMIT the OSIE dataset or the generated 700 maps to version control!

To run the unified pipeline on an entire folder (e.g., your local OSIE path), you can use the original tested batch script:
```bash
python detection/run_detection_features.py --input_dir /path/to/osie/images --output_dir /path/to/osie/outputs
```

## E. Output Directory Structure
Running the pipeline will yield the following strict structure:
```text
outputs/
├── text_map/
│   └── <image_id>.npy
├── face_map/
│   └── <image_id>.npy
├── object_map/
│   └── <image_id>.npy
├── detections/
│   ├── <image_id>_ocr.json
│   ├── <image_id>_face.json
│   └── <image_id>_object.json
└── summary.json
```

## F. Map Format
Every generated `.npy` file strictly adheres to:
- **Shape:** `(288, 384)` (Height: 288, Width: 384)
- **Dtype:** `float32`
- **Range:** `[0.0, 1.0]` (No NaNs, No Infs)

## G. Coordinate Convention
The pipeline uses a **direct stretch resize**. It maps the original dimensions `(W, H)` directly down to `(384, 288)` without preserving aspect ratio padding. This exactly mirrors the standard TranSalNet preprocessing distortions.

## H. Example Python Usage (Public API)
If you need programmatic access, we have exposed clean wrappers:

```python
from detection.ocr import load_ocr
from detection.yunet import load_yunet
from detection.yolo_world import load_yolo_world
from detection.public_api import process_image

# 1. Initialize models ONCE
models = {
    'ocr': load_ocr(),
    'yunet': load_yunet(),
    'yolo': load_yolo_world()
}

# 2. Process image directly
result = process_image(
    image_path="path/to/image.jpg",
    models=models,
    output_dir="path/to/output_dir"
)

print(result)
```
