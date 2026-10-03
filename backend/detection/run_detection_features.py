import os
import json
import argparse
import time
import numpy as np
from pathlib import Path

# Importers for the 3 pipelines
from paddleocr import PaddleOCR
from ultralytics import YOLO
import batch_face
import batch_ocr
import batch_object

def check_map(m):
    return (m.shape == (288, 384) and 
            m.dtype == np.float32 and 
            np.min(m) >= 0.0 and 
            np.max(m) <= 1.0 and 
            not np.isnan(m).any() and 
            not np.isinf(m).any())

def main():
    parser = argparse.ArgumentParser(description="Unified Batch Detection Pipeline")
    parser.add_argument("--input_dir", required=True, help="Input directory of images")
    parser.add_argument("--output_dir", required=True, help="Output directory")
    args = parser.parse_args()
    
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    
    if not input_dir.exists():
        print(f"Error: {input_dir} not found.")
        return
        
    (output_dir / "text_map").mkdir(parents=True, exist_ok=True)
    (output_dir / "face_map").mkdir(parents=True, exist_ok=True)
    (output_dir / "object_map").mkdir(parents=True, exist_ok=True)
    (output_dir / "detections").mkdir(parents=True, exist_ok=True)
    
    valid_exts = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    images = [f for f in input_dir.iterdir() if f.is_file() and f.suffix.lower() in valid_exts]
    
    if not images:
        print("No valid images found.")
        return
        
    print(f"Found {len(images)} images to process.")
    print("Loading models (this happens only ONCE)...")
    
    t_start_load = time.time()
    
    # PaddleOCR
    ocr_model = PaddleOCR(use_textline_orientation=True, lang='en')
    
    # YuNet
    yunet_path = str(Path(__file__).resolve().parent.parent / "models" / "yunet" / "face_detection_yunet_2023mar.onnx")
    yunet_model = batch_face.get_yunet(yunet_path, 320, 320)
    
    # YOLO-World-S
    yolo_model = YOLO("yolov8s-worldv2.pt")
    vocab = ["person", "car", "phone", "laptop", "computer", "product", 
             "food", "animal", "building", "vehicle", "sports equipment", "money"]
    yolo_model.set_classes(vocab)
    
    print(f"Models loaded in {time.time() - t_start_load:.2f}s")
    
    stats = {
        "total_images": len(images),
        "successful_images": 0,
        "failed_images": 0,
        "images_with_text": 0,
        "images_with_faces": 0,
        "images_with_objects": 0,
        "total_text_regions": 0,
        "total_faces": 0,
        "total_objects": 0,
        "avg_time_per_image": 0.0,
        "total_processing_time": 0.0,
        "total_ocr_inference_time": 0.0,
        "total_face_inference_time": 0.0,
        "total_obj_inference_time": 0.0,
        "total_map_generation_time": 0.0
    }
    
    global_start = time.time()
    
    for idx, img_path in enumerate(images, 1):
        print(f"[{idx}/{len(images)}] Processing {img_path.name}...")
        img_id = img_path.stem
        
        t0 = time.time()
        
        # 1. OCR (returns text_map as well)
        o_succ, text_map, ocr_json, img_rgb, num_texts, ocr_inf_time, ocr_err = batch_ocr.process_image(img_path, ocr_model)
        if not o_succ:
            print(f"  Warning: Failed on OCR -> {ocr_err}")
            stats["failed_images"] += 1
            continue
            
        # 2. YuNet (returns face_map as well)
        t_face_0 = time.time()
        f_succ, face_map, face_json, num_faces, face_err = batch_face.process_image(img_path, yunet_model)
        face_inf_time = time.time() - t_face_0
        
        if not f_succ:
            print(f"  Warning: Failed on YuNet -> {face_err}")
            stats["failed_images"] += 1
            continue
            
        # 3. YOLO-World-S (returns object_map as well)
        y_succ, object_map, obj_json, num_objects, obj_inf_time, obj_err = batch_object.process_image(img_path, yolo_model)
        if not y_succ:
            print(f"  Warning: Failed on YOLO-World -> {obj_err}")
            stats["failed_images"] += 1
            continue
            
        t1 = time.time()
        total_img_time = t1 - t0
        
        # Map generation time approximation: Since our imported process_image functions generate the map
        # internally along with inference, we can roughly estimate inference vs map generation by checking difference
        # between total time and recorded inference times. We will just record total time.
        
        # Validation checks
        if not check_map(text_map):
            print(f"  Warning: Map validation failed for text_map on {img_path.name}")
            stats["failed_images"] += 1
            continue
        if not check_map(face_map):
            print(f"  Warning: Map validation failed for face_map on {img_path.name}")
            stats["failed_images"] += 1
            continue
        if not check_map(object_map):
            print(f"  Warning: Map validation failed for object_map on {img_path.name}")
            stats["failed_images"] += 1
            continue
            
        # Save Maps
        np.save(str(output_dir / "text_map" / f"{img_id}.npy"), text_map)
        np.save(str(output_dir / "face_map" / f"{img_id}.npy"), face_map)
        np.save(str(output_dir / "object_map" / f"{img_id}.npy"), object_map)
        
        # Save JSONs
        with open(str(output_dir / "detections" / f"{img_id}_ocr.json"), 'w') as f: 
            json.dump(ocr_json, f, indent=4)
        with open(str(output_dir / "detections" / f"{img_id}_face.json"), 'w') as f: 
            json.dump(face_json, f, indent=4)
        with open(str(output_dir / "detections" / f"{img_id}_object.json"), 'w') as f: 
            json.dump(obj_json, f, indent=4)
        
        # Metrics updating
        stats["successful_images"] += 1
        stats["total_text_regions"] += num_texts
        stats["total_faces"] += num_faces
        stats["total_objects"] += num_objects
        
        if num_texts > 0: stats["images_with_text"] += 1
        if num_faces > 0: stats["images_with_faces"] += 1
        if num_objects > 0: stats["images_with_objects"] += 1
        
        stats["total_ocr_inference_time"] += ocr_inf_time
        stats["total_face_inference_time"] += face_inf_time
        stats["total_obj_inference_time"] += obj_inf_time
        
    global_end = time.time()
    
    stats["total_processing_time"] = global_end - global_start
    if stats["successful_images"] > 0:
        stats["avg_time_per_image"] = stats["total_processing_time"] / stats["successful_images"]
        
    # Save summary
    with open(str(output_dir / "summary.json"), 'w') as f:
        json.dump(stats, f, indent=4)
        
    print("\n" + "="*45)
    print("Unified Pipeline Summary")
    print("="*45)
    print(f"Total images processed: {stats['total_images']}")
    print(f"Successful images     : {stats['successful_images']}")
    print(f"Failed images         : {stats['failed_images']}")
    print(f"Images with text      : {stats['images_with_text']} ({stats['total_text_regions']} regions)")
    print(f"Images with faces     : {stats['images_with_faces']} ({stats['total_faces']} faces)")
    print(f"Images with objects   : {stats['images_with_objects']} ({stats['total_objects']} objects)")
    print(f"Avg time/image        : {stats['avg_time_per_image']:.4f}s")
    print(f"Total processing time : {stats['total_processing_time']:.2f}s")
    print("="*45)
    print(f"Outputs saved to {output_dir}")

if __name__ == "__main__":
    main()
