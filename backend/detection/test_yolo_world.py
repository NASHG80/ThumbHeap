import argparse
import time
import json
import os
import cv2
import numpy as np
from ultralytics import YOLO
import torch

def main():
    parser = argparse.ArgumentParser(description="Test YOLO-World")
    parser.add_argument("image_path", help="Path to sample image")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        print(f"Error: Image '{args.image_path}' not found.")
        return

    outputs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    out_img_path = os.path.abspath(os.path.join(outputs_dir, "yolo_world_test_result.jpg"))
    out_json_path = os.path.abspath(os.path.join(outputs_dir, "yolo_world_test_result.json"))

    print("Loading model...")
    t0 = time.time()
    # Initialize YOLO-World
    # This will automatically download yolov8s-worldv2.pt if it's not present
    model = YOLO("yolov8s-worldv2.pt")
    
    # Custom vocabulary
    classes = [
        "person", "car", "phone", "laptop", "computer", "product", 
        "food", "animal", "building", "vehicle", "sports equipment", "money"
    ]
    model.set_classes(classes)
    
    t1 = time.time()
    load_time = t1 - t0
    
    device = "CPU" if not torch.cuda.is_available() else "GPU"
    print(f"Model loaded in {load_time:.2f}s on {device}.")

    print("Running inference...")
    # Inference
    t2 = time.time()
    results = model(args.image_path)
    t3 = time.time()
    infer_time = t3 - t2
    
    print(f"Inference took {infer_time:.2f}s.")
    print(f"Total time: {load_time + infer_time:.2f}s.")

    # Image reading for drawing
    img = cv2.imread(args.image_path)
    img_h, img_w = img.shape[:2]
    img_area = img_w * img_h

    output_data = []
    
    # Process results
    for r in results:
        boxes = r.boxes
        if boxes is None:
            continue
            
        for i in range(len(boxes)):
            box = boxes[i]
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = box.conf[0].item()
            cls_id = int(box.cls[0].item())
            
            # Make sure cls_id is valid
            if cls_id < len(r.names):
                class_name = r.names[cls_id]
            else:
                class_name = f"unknown_{cls_id}"
            
            w = x2 - x1
            h = y2 - y1
            rel_area = (w * h) / img_area
            
            det = {
                "class": class_name,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2],
                "width": w,
                "height": h,
                "relative_area": rel_area
            }
            output_data.append(det)
            
            print(f"Detected: {class_name} | Conf: {conf:.4f} | Box: ({x1:.1f}, {y1:.1f}, {x2:.1f}, {y2:.1f}) | W: {w:.1f} | H: {h:.1f} | RelArea: {rel_area:.4f}")
            
            # Draw
            cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            cv2.putText(img, f"{class_name} {conf:.2f}", (int(x1), int(y1) - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
    print(f"Total detections: {len(output_data)}")

    # Save visualization
    cv2.imwrite(out_img_path, img)
    print(f"\nVisualization saved to: {out_img_path}")

    # Save JSON
    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=4)
    print(f"Raw results saved to: {out_json_path}")

if __name__ == "__main__":
    main()
