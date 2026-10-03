import os
import json
import numpy as np
import csv
from pathlib import Path

def main():
    base_dir = Path(__file__).resolve().parent.parent
    out_dir = base_dir / "outputs" / "stress_test"
    csv_path = out_dir / "summary.csv"
    
    images = [p.stem for p in (out_dir / "text_map").glob("*.npy")]
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["image_id", "width", "height", "text_count", "face_count", "object_count", 
                         "text_map_min", "text_map_max", "face_map_min", "face_map_max", 
                         "object_map_min", "object_map_max", "total_time"])
                         
        for img_id in images:
            text_map = np.load(str(out_dir / "text_map" / f"{img_id}.npy"))
            face_map = np.load(str(out_dir / "face_map" / f"{img_id}.npy"))
            obj_map = np.load(str(out_dir / "object_map" / f"{img_id}.npy"))
            
            with open(str(out_dir / "detections" / f"{img_id}_ocr.json")) as jf:
                ocr = json.load(jf)
            with open(str(out_dir / "detections" / f"{img_id}_face.json")) as jf:
                face = json.load(jf)
            with open(str(out_dir / "detections" / f"{img_id}_object.json")) as jf:
                obj = json.load(jf)
                
            width = ocr.get("image_dimensions", {}).get("width", 0)
            height = ocr.get("image_dimensions", {}).get("height", 0)
            
            text_count = len(ocr.get("detections", []))
            face_count = len(face.get("detections", []))
            object_count = len(obj.get("detections", []))
            
            writer.writerow([
                img_id, width, height, text_count, face_count, object_count,
                f"{np.min(text_map):.4f}", f"{np.max(text_map):.4f}",
                f"{np.min(face_map):.4f}", f"{np.max(face_map):.4f}",
                f"{np.min(obj_map):.4f}", f"{np.max(obj_map):.4f}",
                "N/A" # Total time per image was not explicitly logged to JSON, aggregate time was ~1.76s per image
            ])
            
    print(f"Summary CSV created at {csv_path}")

if __name__ == "__main__":
    main()
