import os
import argparse
import numpy as np
from pathlib import Path

def validate_map(m, name):
    if m is None:
        print(f"{name}: FAIL (Not loaded)")
        return False
        
    shape_ok = (m.shape == (288, 384))
    dtype_ok = (m.dtype == np.float32)
    min_ok = (np.min(m) >= 0.0)
    max_ok = (np.max(m) <= 1.0)
    nan_ok = not np.isnan(m).any()
    inf_ok = not np.isinf(m).any()
    
    if shape_ok and dtype_ok and min_ok and max_ok and nan_ok and inf_ok:
        print(f"{name}: PASS")
        return True
    else:
        print(f"{name}: FAIL (Shape: {m.shape}, Dtype: {m.dtype}, Range: [{np.min(m):.2f}, {np.max(m):.2f}], NaN: {not nan_ok}, Inf: {not inf_ok})")
        return False

def main():
    parser = argparse.ArgumentParser(description="Final Person B Sanity Check")
    parser.add_argument("--image_id", default="Screenshot 2026-10-03 011956", help="Target image ID to validate")
    args = parser.parse_args()
    
    image_id = args.image_id
    base_dir = Path(__file__).resolve().parent.parent / "outputs" / "unified_detection_test"
    
    if not base_dir.exists():
        print(f"Error: Unified detection output directory does not exist: {base_dir}")
        return
        
    text_path = base_dir / "text_map" / f"{image_id}.npy"
    face_path = base_dir / "face_map" / f"{image_id}.npy"
    obj_path = base_dir / "object_map" / f"{image_id}.npy"
    
    print(f"Validating outputs for: {image_id}")
    
    try:
        text_map = np.load(str(text_path))
    except Exception as e:
        print(f"Could not load text_map: {e}")
        text_map = None
        
    try:
        face_map = np.load(str(face_path))
    except Exception as e:
        print(f"Could not load face_map: {e}")
        face_map = None
        
    try:
        obj_map = np.load(str(obj_path))
    except Exception as e:
        print(f"Could not load object_map: {e}")
        obj_map = None
        
    v_t = validate_map(text_map, "Text map")
    v_f = validate_map(face_map, "Face map")
    v_o = validate_map(obj_map, "Object map")
    
    if v_t and v_f and v_o:
        features = np.stack([text_map, face_map, obj_map], axis=0)
        print(f"Stacked shape: {features.shape}")
        if features.shape == (3, 288, 384):
            print("Validation successful! Output is perfectly aligned for Fusion Network.")
        else:
            print("Validation failed: Stacked shape mismatch.")
    else:
        print("Validation failed: One or more maps did not pass the contract.")

if __name__ == "__main__":
    main()
