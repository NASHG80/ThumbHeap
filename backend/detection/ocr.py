import sys
from pathlib import Path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path: sys.path.insert(0, str(current_dir))

from paddleocr import PaddleOCR
from detection.batch_ocr import process_image

def load_ocr():
    """
    Initializes and returns the PaddleOCR 3.0.0 model.
    Should be called only once.
    """
    return PaddleOCR(use_textline_orientation=True, lang='en')

def detect_text_and_map(image_path, ocr_model):
    """
    Runs PaddleOCR on the image and automatically generates the text_map.
    Reuses the heavily tested batch_ocr implementation.
    
    Returns:
        success (bool), text_map (ndarray), result_json (dict), num_texts (int)
    """
    success, text_map, result_json, img, num_texts, infer_time, err = process_image(image_path, ocr_model)
    if not success:
        raise RuntimeError(f"OCR Failed: {err}")
    return success, text_map, result_json, num_texts
