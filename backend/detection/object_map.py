import os
import cv2
import json
import argparse
import numpy as np
from ultralytics import YOLO

def generate_object_map(image, detections, output_size=(384, 288)):
    """
    Generate a standardized object attention map from YOLO-World detections.
    """
    orig_h, orig_w = image.shape[:2]
    out_w, out_h = output_size
    
    object_map = np.zeros((out_h, out_w), dtype=np.float32)
    object_params = []
    
    if not detections:
        return object_map, object_params
        
    scale_x = out_w / float(orig_w)
    scale_y = out_h / float(orig_h)
    img_area = float(orig_w * orig_h)
    
    for det in detections:
        class_name = det['class']
        conf = float(det['confidence'])
        x1, y1, x2, y2 = det['bbox']
        
        # Scale bounding box
        res_x1 = int(round(x1 * scale_x))
        res_y1 = int(round(y1 * scale_y))
        res_x2 = int(round(x2 * scale_x))
        res_y2 = int(round(y2 * scale_y))
        
        # Clip to output bounds
        res_x1 = max(0, min(res_x1, out_w - 1))
        res_y1 = max(0, min(res_y1, out_h - 1))
        res_x2 = max(0, min(res_x2, out_w - 1))
        res_y2 = max(0, min(res_y2, out_h - 1))
        
        if res_x2 <= res_x1 or res_y2 <= res_y1:
            continue
            
        # Create a single object mask
        mask = np.zeros((out_h, out_w), dtype=np.float32)
        
        # Fill bounding box area with the confidence score
        mask[res_y1:res_y2, res_x1:res_x2] = conf
        
        # Smooth edges slightly using Gaussian blur
        # Blur size proportional to image size (e.g., ~5% of dimensions) to soften edges 
        # so the map is not an unnaturally hard rectangle.
        ksize_x = int(out_w * 0.05) | 1 # Ensure odd
        ksize_y = int(out_h * 0.05) | 1 # Ensure odd
        
        # Apply Gaussian Blur
        smoothed_mask = cv2.GaussianBlur(mask, (ksize_x, ksize_y), sigmaX=0, sigmaY=0)
        
        # Scale back to max confidence in case blur lowered the peak (for small objects)
        mask_max = np.max(smoothed_mask)
        if mask_max > 0:
            smoothed_mask = smoothed_mask * (conf / mask_max)
            
        # Aggregation: Pixel-wise maximum
        # We use maximum instead of sum so overlapping objects do not cause 
        # the attention values to artificially compound past their individual confidence levels.
        # This keeps the map representative of the strongest object at any given location.
        object_map = np.maximum(object_map, smoothed_mask)
        
        w = x2 - x1
        h = y2 - y1
        rel_area = (w * h) / img_area
        
        object_params.append({
            "class": class_name,
            "confidence": conf,
            "original_bbox": [float(x1), float(y1), float(x2), float(y2)],
            "resized_bbox": [float(res_x1), float(res_y1), float(res_x2), float(res_y2)],
            "width": float(w),
            "height": float(h),
            "relative_area": float(rel_area)
        })
        
    # Ensure final map is strictly in [0, 1]
    object_map = np.clip(object_map, 0.0, 1.0)
    
    return object_map.astype(np.float32), object_params

def overlay_heatmap(image, heatmap):
    """
    Overlay a heatmap (0-1 float32) onto an image.
    """
    h, w = image.shape[:2]
    heatmap_resized = cv2.resize(heatmap, (w, h))
    heatmap_8bit = np.uint8(255 * heatmap_resized)
    colormap = cv2.applyColorMap(heatmap_8bit, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(image, 0.6, colormap, 0.4, 0)
    return overlay

def main():
    parser = argparse.ArgumentParser(description="Test YOLO-World Spatial Map Generation")
    parser.add_argument("image_path", help="Path to sample image")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        print(f"Error: Image '{args.image_path}' not found.")
        return
        
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    outputs_dir = os.path.join(base_dir, "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    
    out_npy_path = os.path.join(outputs_dir, "object_map_test.npy")
    out_img_path = os.path.join(outputs_dir, "object_map_test.jpg")
    out_json_path = os.path.join(outputs_dir, "object_map_test.json")

    # Load image
    img = cv2.imread(args.image_path)
    if img is None:
        print(f"Error: Could not read image '{args.image_path}'")
        return
        
    orig_h, orig_w = img.shape[:2]
    print(f"Original image size: {orig_w}x{orig_h}")

    # Load YOLO-World
    print("Loading YOLO-World model...")
    model = YOLO("yolov8s-worldv2.pt")
    
    # Vocabulary from previous step
    classes = [
        "person", "car", "phone", "laptop", "computer", "product", 
        "food", "animal", "building", "vehicle", "sports equipment", "money"
    ]
    model.set_classes(classes)
    
    print("Running inference...")
    results = model(args.image_path)
    
    # Extract detections into a list of dicts for our generator
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
            
    print(f"Number of objects detected: {len(raw_detections)}")
    classes_found = [d['class'] for d in raw_detections]
    print(f"Classes found: {classes_found}")
    
    # Generate Map
    print("Generating object map...")
    target_size = (384, 288)
    object_map, object_params = generate_object_map(img, raw_detections, output_size=target_size)
    
    print(f"Output map shape: {object_map.shape}")
    print(f"Output map dtype: {object_map.dtype}")
    print(f"Output map min/max: {np.min(object_map):.4f} / {np.max(object_map):.4f}")
    
    # Aggregation info
    print("Aggregation method used: Pixel-wise Maximum (np.maximum)")
    
    # Save outputs
    np.save(out_npy_path, object_map)
    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(object_params, f, indent=4)
        
    overlay_img = overlay_heatmap(img, object_map)
    cv2.imwrite(out_img_path, overlay_img)
    
    print(f"Saved NumPy array to: {out_npy_path}")
    print(f"Saved JSON parameters to: {out_json_path}")
    print(f"Saved visualization to: {out_img_path}")

if __name__ == "__main__":
    main()
