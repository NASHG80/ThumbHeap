import os
import cv2
import json
import argparse
import time
import numpy as np
from pathlib import Path
from ultralytics import YOLO

# Import the existing generation function
from object_map import generate_object_map

def process_image(img_path, model, target_size=(384, 288)):
    # 1. Load image
    img = cv2.imread(str(img_path))
    if img is None:
        return False, None, None, 0, 0, "Unreadable/Invalid image"
        
    orig_h, orig_w = img.shape[:2]
    
    # 2. Run inference
    t0 = time.time()
    results = model(img)
    t1 = time.time()
    infer_time = t1 - t0
    
    # Extract detections
    raw_detections = []
    for r in results:
        boxes = r.boxes
        if boxes is None:
            continue
        for i in range(len(boxes)):
            box = boxes[i]
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = box.conf[0].item()
            cls_id = int(box.cls[0].item())
            class_name = r.names[cls_id] if cls_id < len(r.names) else f"unknown_{cls_id}"
            
            raw_detections.append({
                "class": class_name,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })
            
    num_objects = len(raw_detections)
    
    # 3. Generate spatial map
    object_map, object_params = generate_object_map(img, raw_detections, output_size=target_size)
    
    # Ensure properties
    assert object_map.shape == (288, 384), "Output map must be (288, 384)"
    assert object_map.dtype == np.float32, "Output map must be float32"
    
    # Restructure params for JSON compliance
    final_detections = []
    for p in object_params:
        bbox = p["original_bbox"]
        final_detections.append({
            "class": p["class"],
            "confidence": p["confidence"],
            "original_bbox": bbox,
            "x1": bbox[0],
            "y1": bbox[1],
            "x2": bbox[2],
            "y2": bbox[3],
            "width": p["width"],
            "height": p["height"],
            "relative_area": p["relative_area"],
            "resized_bbox": p["resized_bbox"]
        })
        
    result_json = {
        "image_dimensions": {"width": orig_w, "height": orig_h},
        "detections": final_detections
    }
    
    return True, object_map, result_json, num_objects, infer_time, None

def main():
    parser = argparse.ArgumentParser(description="Batch process YOLO-World object detection and map generation")
    parser.add_argument("--input_dir", required=True, help="Directory containing input images")
    parser.add_argument("--output_dir", required=True, help="Directory to save outputs")
    args = parser.parse_args()
    
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    
    if not input_dir.exists():
        print(f"Error: Input directory {input_dir} does not exist.")
        return
        
    object_map_dir = output_dir / "object_map"
    detections_dir = output_dir / "detections"
    
    object_map_dir.mkdir(parents=True, exist_ok=True)
    detections_dir.mkdir(parents=True, exist_ok=True)
    
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    image_files = [f for f in input_dir.iterdir() if f.is_file() and f.suffix.lower() in valid_extensions]
    
    total_images = len(image_files)
    if total_images == 0:
        print(f"No valid images found in {input_dir}")
        return
        
    print(f"Found {total_images} images to process.")
    
    # Load YOLO-World model ONCE
    print("Loading YOLO-World-S model...")
    model_load_start = time.time()
    model = YOLO("yolov8s-worldv2.pt")
    classes = [
        "person", "car", "phone", "laptop", "computer", "product", 
        "food", "animal", "building", "vehicle", "sports equipment", "money"
    ]
    model.set_classes(classes)
    model_load_end = time.time()
    print(f"Model loaded in {model_load_end - model_load_start:.2f} seconds.")
    
    success_count = 0
    fail_count = 0
    images_with_detections = 0
    total_objects = 0
    total_infer_time = 0.0
    detected_classes = set()
    
    global_start_time = time.time()
    
    for idx, img_path in enumerate(image_files, 1):
        image_id = img_path.stem
        print(f"[{idx}/{total_images}] Processing {img_path.name}...")
        
        success, object_map, result_json, num_objects, infer_time, error_msg = process_image(img_path, model)
        
        if not success:
            print(f"  Warning: Skipped {img_path.name} - {error_msg}")
            fail_count += 1
            continue
            
        # Optional: verify and print stats for the first processed image
        if success_count == 0:
            print(f"  [Check] Map shape: {object_map.shape}, dtype: {object_map.dtype}, min: {np.min(object_map):.4f}, max: {np.max(object_map):.4f}")
            
        # Save map
        out_npy = object_map_dir / f"{image_id}.npy"
        np.save(str(out_npy), object_map)
        
        # Save JSON
        out_json = detections_dir / f"{image_id}.json"
        with open(out_json, 'w', encoding='utf-8') as f:
            json.dump(result_json, f, indent=4)
            
        success_count += 1
        total_objects += num_objects
        total_infer_time += infer_time
        
        if num_objects > 0:
            images_with_detections += 1
            for d in result_json["detections"]:
                detected_classes.add(d["class"])
            
    global_end_time = time.time()
    total_processing_time = global_end_time - global_start_time
    avg_infer_time = total_infer_time / success_count if success_count > 0 else 0
    
    print("\n" + "="*45)
    print("Batch Object Processing Summary")
    print("="*45)
    print(f"Total images processed     : {total_images}")
    print(f"Successful images          : {success_count}")
    print(f"Failed images              : {fail_count}")
    print(f"Images with detections     : {images_with_detections}")
    print(f"Total objects detected     : {total_objects}")
    print(f"Classes detected           : {list(detected_classes)}")
    print(f"Average inference time/img : {avg_infer_time:.4f} seconds")
    print(f"Total processing time      : {total_processing_time:.2f} seconds")
    print("="*45)

if __name__ == "__main__":
    main()
