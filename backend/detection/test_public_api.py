import os
import numpy as np
from pathlib import Path

from detection.ocr import load_ocr
from detection.yunet import load_yunet
from detection.yolo_world import load_yolo_world
from detection.public_api import process_image

def main():
    print("Initializing models...")
    models = {
        'ocr': load_ocr(),
        'yunet': load_yunet(),
        'yolo': load_yolo_world()
    }
    
    base_dir = Path(__file__).resolve().parent.parent
    img_path = base_dir / "testimage" / "Screenshot 2026-10-03 011956.png"
    out_dir = base_dir / "outputs" / "public_api_test"
    
    print(f"\nProcessing {img_path.name} via public API...")
    result = process_image(img_path, models, out_dir)
    print("Process Result:", result)
    
    image_id = img_path.stem
    text_map = np.load(str(out_dir / "text_map" / f"{image_id}.npy"))
    face_map = np.load(str(out_dir / "face_map" / f"{image_id}.npy"))
    object_map = np.load(str(out_dir / "object_map" / f"{image_id}.npy"))
    
    print("\n--- Map Verification ---")
    
    maps = [
        ("Text Map", text_map),
        ("Face Map", face_map),
        ("Object Map", object_map)
    ]
    
    all_passed = True
    
    for name, m in maps:
        shape_ok = (m.shape == (288, 384))
        dtype_ok = (m.dtype == np.float32)
        range_ok = (np.min(m) >= 0.0 and np.max(m) <= 1.0)
        
        passed = shape_ok and dtype_ok and range_ok
        print(f"{name}: {'PASS' if passed else 'FAIL'} | Shape: {m.shape}, Dtype: {m.dtype}, Min: {np.min(m):.4f}, Max: {np.max(m):.4f}")
        if not passed:
            all_passed = False
            
    if all_passed:
        print("\nAll public API outputs conform to the contract and match previous behavior!")
    else:
        print("\nPublic API outputs FAILED the verification check.")

if __name__ == "__main__":
    main()
