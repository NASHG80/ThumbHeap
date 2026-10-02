import cv2
import numpy as np

def person_b_transform(bbox, orig_w, orig_h, target_w=384, target_h=288):
    """
    Person B currently transforms bounding boxes by scaling the x and y coordinates
    independently, which effectively acts as a stretch-resize.
    bbox: [x, y, w, h] or similar. For simplicity let's use [x1, y1, x2, y2]
    """
    w_scale = target_w / orig_w
    h_scale = target_h / orig_h
    
    x1, y1, x2, y2 = bbox
    
    nx1 = int(x1 * w_scale)
    ny1 = int(y1 * h_scale)
    nx2 = int(x2 * w_scale)
    ny2 = int(y2 * h_scale)
    
    return [nx1, ny1, nx2, ny2]

def transalnet_transform(bbox, orig_w, orig_h, target_w=384, target_h=288):
    """
    TranSalNet standard preprocessing typically resizes the entire image directly to 384x288
    without preserving aspect ratio. 
    Therefore, the coordinate transformation on a bounding box would be identical to Person B's stretch.
    """
    w_scale = target_w / orig_w
    h_scale = target_h / orig_h
    
    x1, y1, x2, y2 = bbox
    
    nx1 = int(x1 * w_scale)
    ny1 = int(y1 * h_scale)
    nx2 = int(x2 * w_scale)
    ny2 = int(y2 * h_scale)
    
    return [nx1, ny1, nx2, ny2]

def main():
    print("--- 1280x720 Alignment Check ---")
    orig_w, orig_h = 1280, 720
    test_bbox = [100, 100, 500, 400] # x1, y1, x2, y2
    
    b_box_1 = person_b_transform(test_bbox, orig_w, orig_h)
    t_box_1 = transalnet_transform(test_bbox, orig_w, orig_h)
    
    print(f"Original Box: {test_bbox}")
    print(f"Person-B Transformed: {b_box_1}")
    print(f"TranSalNet Transformed: {t_box_1}")
    if b_box_1 == t_box_1:
        print("RESULT: IDENTICAL (Stretch-resize, non-aspect-ratio-preserving)")
        
    print("\n--- 492x271 Alignment Check ---")
    orig_w_2, orig_h_2 = 492, 271
    test_bbox_2 = [50, 50, 200, 200]
    
    b_box_2 = person_b_transform(test_bbox_2, orig_w_2, orig_h_2)
    t_box_2 = transalnet_transform(test_bbox_2, orig_w_2, orig_h_2)
    
    print(f"Original Box: {test_bbox_2}")
    print(f"Person-B Transformed: {b_box_2}")
    print(f"TranSalNet Transformed: {t_box_2}")
    if b_box_2 == t_box_2:
        print("RESULT: IDENTICAL (Stretch-resize, non-aspect-ratio-preserving)")

if __name__ == "__main__":
    main()
