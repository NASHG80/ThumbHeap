import os
from pathlib import Path

# --- GLOBAL CONFIGURATION ---

# Base directory for models
BASE_DIR = Path(__file__).resolve().parent.parent

# Output Spatial Map Definition
# All generated maps strictly adhere to this constraint
OUTPUT_SIZE = (384, 288) # (width, height) - maps to tensor (288, 384)
DTYPE = "float32"

# --- YUNET CONFIGURATION ---
YUNET_MODEL_PATH = str(BASE_DIR / "models" / "yunet" / "face_detection_yunet_2023mar.onnx")
YUNET_SCORE_THRESHOLD = 0.6
YUNET_NMS_THRESHOLD = 0.3
YUNET_TOP_K = 5000

# --- YOLO-WORLD CONFIGURATION ---
YOLO_MODEL_PATH = "yolov8s-worldv2.pt"
YOLO_VOCABULARY = [
    "person", "car", "phone", "laptop", "computer", "product", 
    "food", "animal", "building", "vehicle", "sports equipment", "money"
]
