import sys
from pathlib import Path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path: sys.path.insert(0, str(current_dir))

from ultralytics import YOLO
from detection.config import YOLO_MODEL_PATH, YOLO_VOCABULARY
from detection.batch_object import process_image

def load_yolo_world():
    """
    Initializes and returns the YOLO-World-S model with the fixed vocabulary.
    Should be called only once.
    """
    model = YOLO(YOLO_MODEL_PATH)
    model.set_classes(YOLO_VOCABULARY)
    return model

def detect_objects_and_map(image_path, yolo_model):
    """
    Runs YOLO-World-S on the image and automatically generates the object_map.
    Reuses the heavily tested batch_object implementation.
    
    Returns:
        success (bool), object_map (ndarray), result_json (dict), num_objects (int)
    """
    success, object_map, result_json, num_objects, infer_time, err = process_image(image_path, yolo_model)
    if not success:
        raise RuntimeError(f"YOLO-World Failed: {err}")
    return success, object_map, result_json, num_objects
