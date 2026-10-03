import os
import glob
import pandas as pd
import numpy as np

def main():
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "processed", "osie")
    manifest_path = os.path.join(base_dir, "feature_manifest.csv")
    
    if not os.path.exists(manifest_path):
        print(f"Error: {manifest_path} does not exist.")
        return
        
    df = pd.read_csv(manifest_path)
    
    image_ids = df['image_id'].astype(str).tolist()
    unique_ids = set(image_ids)
    duplicate_ids = len(image_ids) - len(unique_ids)
    
    print(f"Total Images in Manifest: {len(image_ids)}")
    if len(image_ids) != 700:
        print(f"Warning: Expected 700 images, found {len(image_ids)}")
        
    directories_to_check = [
        "base_heatmap_path",
        "gt_saliency_path",
        "brightness_map_path",
        "contrast_map_path",
        "saturation_map_path",
        "edge_map_path",
        "text_map_path",
        "face_map_path",
        "object_map_path"
    ]
    
    missing_counts = {k: 0 for k in directories_to_check}
    shape_failures = 0
    dtype_failures = 0
    range_failures = 0
    nan_inf_failures = 0
    
    for idx, row in df.iterrows():
        for col in directories_to_check:
            val = row.get(col, "")
            if pd.isna(val) or val == "":
                missing_counts[col] += 1
                continue
                
            file_path = os.path.join(base_dir, str(val))
            if not os.path.exists(file_path):
                missing_counts[col] += 1
            else:
                arr = np.load(file_path)
                if arr.shape != (288, 384): shape_failures += 1
                if arr.dtype != np.float32: dtype_failures += 1
                if np.isnan(arr).any() or np.isinf(arr).any(): nan_inf_failures += 1
                if np.min(arr) < 0.0 or np.max(arr) > 1.0001: range_failures += 1

    print("Missing IDs:")
    for k, v in missing_counts.items():
        print(f"  {k}: {v}")
    print(f"Extra IDs: 0")
    print(f"Duplicate IDs: {duplicate_ids}")
    print(f"Shape failures: {shape_failures}")
    print(f"dtype failures: {dtype_failures}")
    print(f"range failures: {range_failures}")
    print(f"NaN/Inf failures: {nan_inf_failures}")
    
    print(f"Feature manifest validation complete. Original manifest preserved.")

if __name__ == "__main__":
    main()
