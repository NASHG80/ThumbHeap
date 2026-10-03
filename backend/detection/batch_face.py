import os
import cv2
import json
import argparse
import time
import numpy as np
from pathlib import Path

# Import the existing generation function
from face_map import generate_face_map

# YuNet Default Hyperparameters
SCORE_THRESHOLD = 0.6
NMS_THRESHOLD = 0.3
TOP_K = 5000

def get_yunet(model_path, w, h):
    return cv2.FaceDetectorYN.create(
        model=model_path,
        config="",
        input_size=(w, h),
        score_threshold=SCORE_THRESHOLD,
        nms_threshold=NMS_THRESHOLD,
        top_k=TOP_K
    )

def process_image(img_path, detector, target_size=(384, 288)):
    img = cv2.imread(str(img_path))
    if img is None:
        return False, None, None, None, "Unreadable/Invalid image"
        
    orig_h, orig_w = img.shape[:2]
    
    # Update input size dynamically for this specific image
    detector.setInputSize((orig_w, orig_h))
    
    status, faces = detector.detect(img)
    
    # Use existing modular function to generate map and compute properties
    face_map, face_params = generate_face_map(img, faces, output_size=target_size)
    
    # Ensure properties comply with shape and types
    assert face_map.shape == (288, 384), "Output map must be (288, 384)"
    assert face_map.dtype == np.float32, "Output map must be float32"
    
    # Enhance face_params with landmarks and image dimensions to fulfill JSON requirements
    final_detections = []
    if faces is not None and len(faces) > 0:
        for idx, face in enumerate(faces):
            landmarks = list(map(int, face[4:14]))
            landmarks_pairs = [
                {"type": "right_eye", "x": landmarks[0], "y": landmarks[1]},
                {"type": "left_eye", "x": landmarks[2], "y": landmarks[3]},
                {"type": "nose_tip", "x": landmarks[4], "y": landmarks[5]},
                {"type": "right_mouth_corner", "x": landmarks[6], "y": landmarks[7]},
                {"type": "left_mouth_corner", "x": landmarks[8], "y": landmarks[9]}
            ]
            
            f_param = face_params[idx]
            final_detections.append({
                "bbox": f_param["original_bbox"],
                "confidence": f_param["confidence"],
                "landmarks": landmarks_pairs,
                "resized_bbox": f_param["resized_bbox"],
                "sigma": f_param["sigma"]
            })
            
    result = {
        "image_dimensions": {"width": orig_w, "height": orig_h},
        "detections": final_detections
    }
    
    return True, face_map, result, len(final_detections), None

def main():
    parser = argparse.ArgumentParser(description="Batch process YuNet face detection and map generation")
    parser.add_argument("--input_dir", required=True, help="Directory containing input images")
    parser.add_argument("--output_dir", required=True, help="Directory to save outputs")
    args = parser.parse_args()
    
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    
    if not input_dir.exists():
        print(f"Error: Input directory {input_dir} does not exist.")
        return
        
    face_map_dir = output_dir / "face_map"
    detections_dir = output_dir / "detections"
    
    face_map_dir.mkdir(parents=True, exist_ok=True)
    detections_dir.mkdir(parents=True, exist_ok=True)
    
    # Path to YuNet model
    base_dir = Path(__file__).resolve().parent.parent
    model_path = base_dir / "models" / "yunet" / "face_detection_yunet_2023mar.onnx"
    
    if not model_path.exists():
        print(f"Error: YuNet model not found at {model_path}")
        return
        
    # Supported extensions
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    image_files = [f for f in input_dir.iterdir() if f.is_file() and f.suffix.lower() in valid_extensions]
    
    total_images = len(image_files)
    if total_images == 0:
        print(f"No valid images found in {input_dir}")
        return
        
    print(f"Found {total_images} images to process.")
    
    # Initialize a dummy detector, we will resize it dynamically per image
    detector = get_yunet(str(model_path), 320, 320)
    
    success_count = 0
    fail_count = 0
    images_with_faces = 0
    total_faces = 0
    
    start_time = time.time()
    
    for idx, img_path in enumerate(image_files, 1):
        image_id = img_path.stem
        print(f"[{idx}/{total_images}] Processing {img_path.name}...")
        
        success, face_map, result_json, num_faces, error_msg = process_image(img_path, detector)
        
        if not success:
            print(f"  Warning: Skipped {img_path.name} - {error_msg}")
            fail_count += 1
            continue
            
        # Save map
        out_npy = face_map_dir / f"{image_id}.npy"
        np.save(str(out_npy), face_map)
        
        # Save JSON
        out_json = detections_dir / f"{image_id}.json"
        with open(out_json, 'w', encoding='utf-8') as f:
            json.dump(result_json, f, indent=4)
            
        success_count += 1
        total_faces += num_faces
        if num_faces > 0:
            images_with_faces += 1
            
    end_time = time.time()
    total_time = end_time - start_time
    avg_time = total_time / success_count if success_count > 0 else 0
    
    print("\n" + "="*40)
    print("Batch Face Processing Summary")
    print("="*40)
    print(f"Total images processed : {total_images}")
    print(f"Successful images      : {success_count}")
    print(f"Failed images          : {fail_count}")
    print(f"Images with faces      : {images_with_faces}")
    print(f"Total faces detected   : {total_faces}")
    print(f"Avg time per image     : {avg_time:.4f} seconds")
    print("="*40)

if __name__ == "__main__":
    main()
