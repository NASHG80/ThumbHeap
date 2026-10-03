import os
import sys
import json
import numpy as np
from pathlib import Path

# Fix path to allow importing from batch_* files which expect to be run in their own directory
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from detection.ocr import detect_text_and_map
from detection.yunet import detect_faces_and_map
from detection.yolo_world import detect_objects_and_map
from detection.config import OUTPUT_SIZE

def check_map(m):
    if m is None:
        return False
    return (m.shape == (288, 384) and 
            m.dtype == np.float32 and 
            np.min(m) >= 0.0 and 
            np.max(m) <= 1.0 and 
            not np.isnan(m).any() and 
            not np.isinf(m).any())

def process_image(image_path, models, output_dir):
    """
    Unified public processing function.
    
    Args:
        image_path (str or Path): Path to the single input image.
        models (dict): Dictionary containing initialized models:
            {'ocr': ocr_model, 'yunet': yunet_model, 'yolo': yolo_model}
        output_dir (str or Path): Output directory where maps/detections will be saved.
    
    Returns:
        dict: Summary of processing containing success and path information.
    """
    image_path = Path(image_path)
    output_dir = Path(output_dir)
    image_id = image_path.stem
    
    # Setup subdirectories
    text_dir = output_dir / "text_map"
    face_dir = output_dir / "face_map"
    object_dir = output_dir / "object_map"
    det_dir = output_dir / "detections"
    
    for d in [text_dir, face_dir, object_dir, det_dir]:
        d.mkdir(parents=True, exist_ok=True)
        
    ocr_model = models.get('ocr')
    yunet_model = models.get('yunet')
    yolo_model = models.get('yolo')
    
    if not all([ocr_model, yunet_model, yolo_model]):
        raise ValueError("Missing one or more required models in the models dictionary.")
        
    # 1. OCR
    t_succ, text_map, t_json, t_num = detect_text_and_map(image_path, ocr_model)
    # 2. YuNet
    f_succ, face_map, f_json, f_num = detect_faces_and_map(image_path, yunet_model)
    # 3. YOLO-World
    o_succ, object_map, o_json, o_num = detect_objects_and_map(image_path, yolo_model)
    
    if not (check_map(text_map) and check_map(face_map) and check_map(object_map)):
        raise RuntimeError(f"Map validation failed for {image_id}")
        
    # Save Maps
    np.save(str(text_dir / f"{image_id}.npy"), text_map)
    np.save(str(face_dir / f"{image_id}.npy"), face_map)
    np.save(str(object_dir / f"{image_id}.npy"), object_map)
    
    # Save Detections
    with open(str(det_dir / f"{image_id}_ocr.json"), 'w') as f: json.dump(t_json, f, indent=4)
    with open(str(det_dir / f"{image_id}_face.json"), 'w') as f: json.dump(f_json, f, indent=4)
    with open(str(det_dir / f"{image_id}_object.json"), 'w') as f: json.dump(o_json, f, indent=4)
    
    return {
        "image_id": image_id,
        "success": True,
        "texts_detected": t_num,
        "faces_detected": f_num,
        "objects_detected": o_num
    }
