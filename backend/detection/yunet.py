import sys
from pathlib import Path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path: sys.path.insert(0, str(current_dir))

import cv2
import os
from detection.config import YUNET_MODEL_PATH, YUNET_SCORE_THRESHOLD, YUNET_NMS_THRESHOLD, YUNET_TOP_K
from detection.batch_face import process_image

def load_yunet():
    """
    Initializes and returns the OpenCV YuNet model.
    Should be called only once.
    """
    if not os.path.exists(YUNET_MODEL_PATH):
        raise FileNotFoundError(f"YuNet model missing at {YUNET_MODEL_PATH}")
        
    return cv2.FaceDetectorYN.create(
        model=YUNET_MODEL_PATH,
        config="",
        input_size=(320, 320), # Dummy size, updated per image
        score_threshold=YUNET_SCORE_THRESHOLD,
        nms_threshold=YUNET_NMS_THRESHOLD,
        top_k=YUNET_TOP_K
    )

def detect_faces_and_map(image_path, yunet_model):
    """
    Runs YuNet on the image and automatically generates the face_map.
    Reuses the heavily tested batch_face implementation.
    
    Returns:
        success (bool), face_map (ndarray), result_json (dict), num_faces (int)
    """
    success, face_map, result_json, num_faces, err = process_image(image_path, yunet_model)
    if not success:
        raise RuntimeError(f"YuNet Failed: {err}")
    return success, face_map, result_json, num_faces
