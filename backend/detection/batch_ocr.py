import os
import cv2
import json
import argparse
import time
import numpy as np
from pathlib import Path
from paddleocr import PaddleOCR

from text_map import generate_text_map, overlay_heatmap

def process_image(img_path, ocr_model, target_size=(384, 288)):
    img = cv2.imread(str(img_path))
    if img is None:
        return False, None, None, None, 0, 0, "Unreadable/Invalid image"
        
    orig_h, orig_w = img.shape[:2]
    
    t0 = time.time()
    # PaddleOCR 3.0.0 API
    result = ocr_model.predict(str(img_path))
    t1 = time.time()
    infer_time = t1 - t0
    
    raw_detections = []
    
    # Process PaddleOCR results
    if result is not None and len(result) > 0 and result[0] is not None:
        res = result[0]
        texts = res.get('rec_texts', [])
        scores = res.get('rec_scores', [])
        boxes = res.get('dt_polys', res.get('rec_polys', []))
        
        for i in range(len(texts)):
            text = texts[i]
            score = float(scores[i]) if hasattr(scores[i], '__float__') else scores[i]
            box_arr = boxes[i]
            box = box_arr.tolist() if hasattr(box_arr, 'tolist') else box_arr
            
            raw_detections.append({
                "text": text,
                "confidence": score,
                "box": box
            })
            
    num_texts = len(raw_detections)
    
    # Generate text map and compute visual features
    text_map, text_params = generate_text_map(img, raw_detections, output_size=target_size)
    
    # Ensure properties
    assert text_map.shape == (288, 384)
    assert text_map.dtype == np.float32
    
    result_json = {
        "image_dimensions": {"width": orig_w, "height": orig_h},
        "detections": text_params
    }
    
    return True, text_map, result_json, img, num_texts, infer_time, None

def main():
    parser = argparse.ArgumentParser(description="Batch process PaddleOCR text map generation")
    parser.add_argument("--input_dir", required=True, help="Directory containing input images")
    parser.add_argument("--output_dir", required=True, help="Directory to save outputs")
    args = parser.parse_args()
    
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    
    if not input_dir.exists():
        print(f"Error: {input_dir} not found.")
        return
        
    map_dir = output_dir / "text_map"
    det_dir = output_dir / "detections"
    viz_dir = output_dir / "visualizations"
    
    map_dir.mkdir(parents=True, exist_ok=True)
    det_dir.mkdir(parents=True, exist_ok=True)
    viz_dir.mkdir(parents=True, exist_ok=True)
    
    valid_ext = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    images = [f for f in input_dir.iterdir() if f.is_file() and f.suffix.lower() in valid_ext]
    
    total = len(images)
    if total == 0:
        print("No valid images found.")
        return
        
    print(f"Found {total} images.")
    print("Initializing PaddleOCR 3.0.0...")
    
    load_start = time.time()
    # Initialize PaddleOCR model (loaded ONCE)
    ocr = PaddleOCR(use_textline_orientation=True, lang='en')
    load_end = time.time()
    print(f"Model loaded in {load_end - load_start:.2f}s")
    
    success_count = 0
    fail_count = 0
    images_with_text = 0
    total_texts = 0
    total_infer_time = 0.0
    
    global_start = time.time()
    
    for idx, img_path in enumerate(images, 1):
        print(f"[{idx}/{total}] Processing {img_path.name}...")
        
        success, text_map, result_json, img, num_texts, infer_time, err = process_image(img_path, ocr)
        
        if not success:
            print(f"  Warning: Skipped {img_path.name} - {err}")
            fail_count += 1
            continue
            
        img_id = img_path.stem
        
        # Save Outputs
        np.save(str(map_dir / f"{img_id}.npy"), text_map)
        with open(str(det_dir / f"{img_id}.json"), 'w', encoding='utf-8') as f:
            json.dump(result_json, f, indent=4, ensure_ascii=False)
            
        # Optional overlay visualization
        boxes = [d["original_bbox"] for d in result_json["detections"]]
        overlay_img = overlay_heatmap(img, text_map, boxes)
        cv2.imwrite(str(viz_dir / f"{img_id}.jpg"), overlay_img)
        
        success_count += 1
        total_texts += num_texts
        total_infer_time += infer_time
        
        if num_texts > 0:
            images_with_text += 1
            
        if success_count == 1:
            print(f"  [Check] Map shape: {text_map.shape}, dtype: {text_map.dtype}, min: {np.min(text_map):.4f}, max: {np.max(text_map):.4f}")
            if num_texts > 0:
                print(f"  [Check] Sample text: '{result_json['detections'][0]['text']}' | conf: {result_json['detections'][0]['confidence']:.4f}")

    global_end = time.time()
    
    print("\n" + "="*45)
    print("Batch OCR Processing Summary")
    print("="*45)
    print(f"Total images processed     : {total}")
    print(f"Successful images          : {success_count}")
    print(f"Failed images              : {fail_count}")
    print(f"Images with text           : {images_with_text}")
    print(f"Total text regions detected: {total_texts}")
    print(f"Average processing time/img: {total_infer_time/success_count if success_count else 0:.4f} seconds")
    print(f"Total processing time      : {global_end - global_start:.2f} seconds")
    print("="*45)

if __name__ == "__main__":
    main()
