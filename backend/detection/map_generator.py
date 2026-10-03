import sys
from pathlib import Path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path: sys.path.insert(0, str(current_dir))

from detection.text_map import generate_text_map as _generate_text_map
from detection.face_map import generate_face_map as _generate_face_map
from detection.object_map import generate_object_map as _generate_object_map
from detection.config import OUTPUT_SIZE

def generate_text_map(image, detections):
    """
    Generate a text heatmap given the raw detections and image.
    Outputs a float32 NumPy array of shape (288, 384) with values [0, 1].
    """
    map_array, _ = _generate_text_map(image, detections, output_size=OUTPUT_SIZE)
    return map_array

def generate_face_map(image, detections):
    """
    Generate a face Gaussian heatmap given the raw detections and image.
    Outputs a float32 NumPy array of shape (288, 384) with values [0, 1].
    """
    map_array, _ = _generate_face_map(image, detections, output_size=OUTPUT_SIZE)
    return map_array

def generate_object_map(image, detections):
    """
    Generate an object heatmap given the raw YOLO-World detections and image.
    Outputs a float32 NumPy array of shape (288, 384) with values [0, 1].
    """
    map_array, _ = _generate_object_map(image, detections, output_size=OUTPUT_SIZE)
    return map_array
