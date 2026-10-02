import cv2
import numpy as np

def calculate_visual_features(image, box_pts):
    """
    Calculate visual features (brightness, saturation, contrast) for a given polygonal region.
    """
    # Create mask for the bounding box
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [box_pts], 255)
    
    # Calculate properties in the masked region
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    v_channel = hsv[:,:,2]
    s_channel = hsv[:,:,1]
    
    # Brightness and Saturation
    mean_brightness = cv2.mean(v_channel, mask=mask)[0]
    mean_saturation = cv2.mean(s_channel, mask=mask)[0]
    
    # Simple contrast (standard deviation of grayscale values in the box)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mean_val, std_val = cv2.meanStdDev(gray, mask=mask)
    contrast = std_val[0][0]
    
    return mean_brightness, mean_saturation, contrast

def generate_text_map(image, detections, output_size=(384, 288)):
    orig_h, orig_w = image.shape[:2]
    out_w, out_h = output_size
    
    text_map = np.zeros((out_h, out_w), dtype=np.float32)
    text_params = []
    
    if not detections:
        return text_map, text_params
        
    scale_x = out_w / float(orig_w)
    scale_y = out_h / float(orig_h)
    img_area = float(orig_w * orig_h)
    
    for det in detections:
        text = det['text']
        conf = float(det['confidence'])
        box = det['box'] # List of [x,y] points
        
        box_pts = np.array(box, dtype=np.int32)
        
        # Calculate Visual Features on original image
        brightness, saturation, contrast = calculate_visual_features(image, box_pts)
        
        # Extract bounding box rectangle bounding the polygon
        x_coords = box_pts[:, 0]
        y_coords = box_pts[:, 1]
        x1, y1 = np.min(x_coords), np.min(y_coords)
        x2, y2 = np.max(x_coords), np.max(y_coords)
        
        # Resized bounding box
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
            
        w = x2 - x1
        h = y2 - y1
        rel_area = float(w * h) / img_area
        
        cx = x1 + w / 2.0
        cy = y1 + h / 2.0
        
        # Create a spatial region (similar to object map, softened bounding box)
        mask = np.zeros((out_h, out_w), dtype=np.float32)
        
        # Scale polygon points for mapping
        res_box_pts = box_pts.astype(np.float32)
        res_box_pts[:, 0] *= scale_x
        res_box_pts[:, 1] *= scale_y
        res_box_pts = res_box_pts.astype(np.int32)
        
        # Fill polygon area with confidence score
        cv2.fillPoly(mask, [res_box_pts], conf)
        
        # Smooth edges to make the text region a soft blob
        ksize_x = int(out_w * 0.03) | 1
        ksize_y = int(out_h * 0.03) | 1
        smoothed_mask = cv2.GaussianBlur(mask, (ksize_x, ksize_y), sigmaX=0, sigmaY=0)
        
        # Scale back to max confidence in case blur lowered the peak
        mask_max = np.max(smoothed_mask)
        if mask_max > 0:
            smoothed_mask = smoothed_mask * (conf / mask_max)
            
        # Aggregation: Pixel-wise Maximum
        # Maximum is used so that overlapping or densely packed text boxes 
        # don't artificially push the sum beyond the maximum confidence [0,1].
        text_map = np.maximum(text_map, smoothed_mask)
        
        text_params.append({
            "text": text,
            "confidence": conf,
            "original_bbox": [[float(pt[0]), float(pt[1])] for pt in box],
            "resized_bbox": [float(res_x1), float(res_y1), float(res_x2), float(res_y2)],
            "width": float(w),
            "height": float(h),
            "relative_area": rel_area,
            "center_x": float(cx),
            "center_y": float(cy),
            "visual_features": {
                "avg_brightness": float(brightness),
                "avg_saturation": float(saturation),
                "contrast": float(contrast)
            }
        })
        
    # Ensure final map is strictly in [0, 1]
    text_map = np.clip(text_map, 0.0, 1.0)
    
    return text_map.astype(np.float32), text_params

def overlay_heatmap(image, heatmap, boxes=None):
    """
    Overlay a heatmap (0-1 float32) onto an image and optionally draw boxes.
    """
    h, w = image.shape[:2]
    heatmap_resized = cv2.resize(heatmap, (w, h))
    heatmap_8bit = np.uint8(255 * heatmap_resized)
    colormap = cv2.applyColorMap(heatmap_8bit, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(image, 0.6, colormap, 0.4, 0)
    
    if boxes is not None:
        for box in boxes:
            box_pts = np.array(box).astype(np.int32).reshape((-1, 1, 2))
            cv2.polylines(overlay, [box_pts], isClosed=True, color=(0, 255, 0), thickness=2)
            
    return overlay
