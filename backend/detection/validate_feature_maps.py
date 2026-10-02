import os
import cv2
import json
import argparse
import numpy as np
from pathlib import Path

def validate_map(map_path, name):
    print(f"\n--- Validating {name} ---")
    
    if not os.path.exists(map_path):
        print(f"FAIL: File does not exist -> {map_path}")
        return False, None, None, None, None
        
    try:
        data = np.load(map_path)
    except Exception as e:
        print(f"FAIL: Could not load .npy file -> {e}")
        return False, None, None, None, None
        
    shape = data.shape
    dtype = data.dtype
    
    shape_ok = (shape == (288, 384))
    dtype_ok = (dtype == np.float32)
    
    if not shape_ok:
        print(f"FAIL: Shape {shape} != (288, 384)")
    else:
        print(f"PASS: Shape == (288, 384)")
        
    if not dtype_ok:
        print(f"FAIL: Dtype {dtype} != float32")
    else:
        print(f"PASS: Dtype == float32")
        
    has_nan = np.isnan(data).any()
    has_inf = np.isinf(data).any()
    
    if has_nan:
        print("FAIL: Map contains NaN values")
    else:
        print("PASS: No NaN values")
        
    if has_inf:
        print("FAIL: Map contains Infinite values")
    else:
        print("PASS: No infinite values")
        
    min_val = float(np.min(data)) if not has_nan and not has_inf else 0.0
    max_val = float(np.max(data)) if not has_nan and not has_inf else 0.0
    
    range_ok = (min_val >= 0.0 and max_val <= 1.0)
    if not range_ok:
        print(f"FAIL: Values out of range [0, 1] -> min:{min_val:.4f}, max:{max_val:.4f}")
    else:
        print(f"PASS: Range [0, 1] -> min:{min_val:.4f}, max:{max_val:.4f}")
        
    is_empty = data.size == 0
    if is_empty:
        print("FAIL: Array is empty (size 0)")
    else:
        print("PASS: Array is non-empty")
        
    all_zero = (max_val == 0.0)
    if all_zero:
        print("INFO: Array is all-zeros (valid for no detections)")
        
    is_valid = shape_ok and dtype_ok and not has_nan and not has_inf and range_ok and not is_empty
    
    if is_valid:
        print(f">> {name} is VALID")
    else:
        print(f">> {name} is INVALID")
        
    return is_valid, data, shape, dtype, (min_val, max_val)

def overlay_heatmap(image, heatmap, color_channel=2):
    """
    Overlay a single-channel heatmap onto an image using a specific color.
    color_channel: 0 (Blue), 1 (Green), 2 (Red)
    """
    h, w = image.shape[:2]
    heatmap_resized = cv2.resize(heatmap, (w, h))
    
    color_map = np.zeros((h, w, 3), dtype=np.uint8)
    color_map[:, :, color_channel] = np.uint8(255 * heatmap_resized)
    
    # Add colored heatmap to image
    overlay = cv2.addWeighted(image, 0.5, color_map, 0.5, 0)
    return overlay

def draw_boxes(image, json_path, color):
    if not os.path.exists(json_path):
        return image
        
    with open(json_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except:
            return image
            
    detections = data.get('detections', [])
    if not detections:
        # Some formats might have direct list instead of dict
        if isinstance(data, list):
            detections = data
            
    res = image.copy()
    for det in detections:
        if 'original_bbox' in det:
            bbox = det['original_bbox']
        elif 'bbox' in det:
            bbox = det['bbox']
        elif 'box' in det:
            bbox = det['box']
        else:
            continue
            
        if isinstance(bbox[0], list): # Polygon
            pts = np.array(bbox, dtype=np.int32).reshape((-1, 1, 2))
            cv2.polylines(res, [pts], True, color, 2)
        else: # Rectangle x1, y1, x2, y2
            x1, y1, x2, y2 = [int(v) for v in bbox[:4]]
            cv2.rectangle(res, (x1, y1), (x2, y2), color, 2)
            
    return res

def main():
    parser = argparse.ArgumentParser(description="Validate and combine feature maps")
    parser.add_argument("--image_id", required=True, help="Image ID (filename without extension)")
    
    base_dir = Path(__file__).parent.parent
    
    parser.add_argument("--text_map_dir", default=str(base_dir / "outputs" / "batch_ocr" / "text_map"))
    parser.add_argument("--face_map_dir", default=str(base_dir / "outputs" / "batch_face" / "face_map"))
    parser.add_argument("--object_map_dir", default=str(base_dir / "outputs" / "batch_object" / "object_map"))
    
    parser.add_argument("--text_det_dir", default=str(base_dir / "outputs" / "batch_ocr" / "detections"))
    parser.add_argument("--face_det_dir", default=str(base_dir / "outputs" / "batch_face" / "detections"))
    parser.add_argument("--object_det_dir", default=str(base_dir / "outputs" / "batch_object" / "detections"))
    
    parser.add_argument("--image_dir", default=str(base_dir / "testimage"))
    args = parser.parse_args()
    
    image_id = args.image_id
    
    text_map_path = os.path.join(args.text_map_dir, f"{image_id}.npy")
    face_map_path = os.path.join(args.face_map_dir, f"{image_id}.npy")
    object_map_path = os.path.join(args.object_map_dir, f"{image_id}.npy")
    
    v_text, text_map, text_s, text_dt, text_r = validate_map(text_map_path, "Text Map")
    v_face, face_map, face_s, face_dt, face_r = validate_map(face_map_path, "Face Map")
    v_obj, object_map, obj_s, obj_dt, obj_r = validate_map(object_map_path, "Object Map")
    
    print("\n--- Cross-Map Validation ---")
    if not (v_text and v_face and v_obj):
        print("FAIL: Cannot proceed with cross-map validation due to invalid individual maps.")
        return
        
    print("PASS: All maps correspond to the same image_id.")
    
    if text_s == face_s == obj_s:
        print("PASS: All three maps have exactly identical shape.")
    else:
        print("FAIL: Map shapes differ.")
        
    print("PASS: Values use the same [0,1] convention.")
    
    features = np.stack([text_map, face_map, object_map], axis=0)
    print(f"PASS: Stacked features shape == {features.shape}")
    assert features.shape == (3, 288, 384), "Features shape mismatch!"
    
    # Validation output dir
    out_dir = base_dir / "outputs" / "feature_validation"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Save combined feature file
    features_npy_path = out_dir / f"{image_id}_features.npy"
    features_json_path = out_dir / f"{image_id}_features.json"
    
    np.save(str(features_npy_path), features)
    
    # Try finding image
    img_path = None
    for ext in ['.png', '.jpg', '.jpeg']:
        p = os.path.join(args.image_dir, f"{image_id}{ext}")
        if os.path.exists(p):
            img_path = p
            break
            
    img_w, img_h = 0, 0
    img = None
    if img_path:
        img = cv2.imread(img_path)
        if img is not None:
            img_h, img_w = img.shape[:2]
            
    meta_json = {
        "image_id": image_id,
        "original_image_dimensions": {"width": img_w, "height": img_h},
        "map_dimensions": {"width": 384, "height": 288},
        "channel_order": ["text_map", "face_map", "object_map"],
        "map_statistics": {
            "text_map": {"min": text_r[0], "max": text_r[1]},
            "face_map": {"min": face_r[0], "max": face_r[1]},
            "object_map": {"min": obj_r[0], "max": obj_r[1]}
        }
    }
    
    with open(features_json_path, 'w', encoding='utf-8') as f:
        json.dump(meta_json, f, indent=4)
        
    # Visual Diagnostics
    if img is not None:
        # Overlays
        text_overlay = overlay_heatmap(img.copy(), text_map, color_channel=2) # Red
        text_overlay = draw_boxes(text_overlay, os.path.join(args.text_det_dir, f"{image_id}.json"), (0, 0, 255))
        
        face_overlay = overlay_heatmap(img.copy(), face_map, color_channel=1) # Green
        face_overlay = draw_boxes(face_overlay, os.path.join(args.face_det_dir, f"{image_id}.json"), (0, 255, 0))
        
        obj_overlay = overlay_heatmap(img.copy(), object_map, color_channel=0) # Blue
        obj_overlay = draw_boxes(obj_overlay, os.path.join(args.object_det_dir, f"{image_id}.json"), (255, 0, 0))
        
        # Combined three-channel feature visualization
        # We'll create an RGB image directly from the maps
        # Resize all to original image size for display
        text_resized = cv2.resize(text_map, (img_w, img_h))
        face_resized = cv2.resize(face_map, (img_w, img_h))
        obj_resized = cv2.resize(object_map, (img_w, img_h))
        
        combined_features = np.zeros((img_h, img_w, 3), dtype=np.uint8)
        combined_features[:, :, 2] = np.uint8(255 * text_resized) # R
        combined_features[:, :, 1] = np.uint8(255 * face_resized) # G
        combined_features[:, :, 0] = np.uint8(255 * obj_resized)  # B
        
        # Blend combined features with original image for alignment check
        combined_overlay = cv2.addWeighted(img, 0.3, combined_features, 0.7, 0)
        
        # Arrange in a grid:
        # Top-left: Original | Top-right: Combined Overlay
        # Bot-left: Text (Red) | Bot-mid: Face (Green) | Bot-right: Object (Blue)
        
        h1 = np.hstack([img, combined_overlay])
        
        # We need three side-by-side for bottom row, so let's just make it a 2x2 or 2x3 grid.
        # Let's resize them to fit nicely.
        # Original, Text | Face, Object | Combined, ...
        # Let's just create a 2x3 grid
        row1 = np.hstack([img, text_overlay, face_overlay])
        row2 = np.hstack([obj_overlay, combined_features, combined_overlay])
        grid = np.vstack([row1, row2])
        
        # Scale grid down if it's too big
        grid_h, grid_w = grid.shape[:2]
        if grid_w > 1920:
            scale = 1920.0 / grid_w
            grid = cv2.resize(grid, (0,0), fx=scale, fy=scale)
            
        diag_path = out_dir / f"{image_id}_diagnostic.jpg"
        cv2.imwrite(str(diag_path), grid)
        print(f"PASS: Spatial alignment diagnostic generated -> {diag_path}")
    else:
        print("FAIL: Original image not found, cannot generate diagnostic.")

    print("\n--- Output Files Created ---")
    print(f"- {features_npy_path}")
    print(f"- {features_json_path}")

if __name__ == "__main__":
    main()
