import os
import glob
import pandas as pd
import numpy as np

def main():
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "processed", "osie")
    
    images_dir = os.path.join(base_dir, "images")
    if not os.path.exists(images_dir):
        print(f"Error: {images_dir} does not exist.")
        return

    image_files = glob.glob(os.path.join(images_dir, "*.jpg"))
    image_ids = sorted([os.path.splitext(os.path.basename(f))[0] for f in image_files])

    if len(image_ids) != 700:
        print(f"Warning: Expected 700 images, found {len(image_ids)}")

    directories_to_check = {
        "gt_saliency": "gt_saliency",
        "brightness_map": "brightness_map",
        "contrast_map": "contrast_map",
        "saturation_map": "saturation_map",
        "edge_map": "edge_map",
        "text_map": "text_map",
        "face_map": "face_map",
        "object_map": "object_map"
    }

    manifest_rows = []
    
    missing_counts = {k: 0 for k in directories_to_check.keys()}
    extra_ids = []
    duplicate_ids = 0 # using a set ensures uniqueness, but we can check if file names match
    shape_failures = 0
    dtype_failures = 0
    range_failures = 0
    nan_inf_failures = 0

    for img_id in image_ids:
        row = {
            "image_id": img_id,
            "image_path": f"images/{img_id}.jpg",
            "base_heatmap_path": "", # To be filled by Person A
        }
        
        for name, folder in directories_to_check.items():
            file_path = os.path.join(base_dir, folder, f"{img_id}.npy")
            if not os.path.exists(file_path):
                missing_counts[name] += 1
                row[f"{name}_path"] = ""
            else:
                row[f"{name}_path"] = f"{folder}/{img_id}.npy"
                
                # Check properties
                arr = np.load(file_path)
                if arr.shape != (288, 384): shape_failures += 1
                if arr.dtype != np.float32: dtype_failures += 1
                if np.isnan(arr).any() or np.isinf(arr).any(): nan_inf_failures += 1
                if np.min(arr) < 0.0 or np.max(arr) > 1.0001: range_failures += 1
                
        manifest_rows.append(row)

    # Check for extra ids
    for name, folder in directories_to_check.items():
        folder_path = os.path.join(base_dir, folder)
        if os.path.exists(folder_path):
            files = glob.glob(os.path.join(folder_path, "*.npy"))
            folder_ids = [os.path.splitext(os.path.basename(f))[0] for f in files]
            extras = set(folder_ids) - set(image_ids)
            for e in extras:
                extra_ids.append(f"{name}/{e}.npy")

    print(f"Total Images: {len(image_ids)}")
    print("Missing IDs:")
    for k, v in missing_counts.items():
        print(f"  {k}: {v}")
    print(f"Extra IDs: {len(extra_ids)}")
    print(f"Duplicate IDs: {duplicate_ids}")
    print(f"Shape failures: {shape_failures}")
    print(f"dtype failures: {dtype_failures}")
    print(f"range failures: {range_failures}")
    print(f"NaN/Inf failures: {nan_inf_failures}")

    # Write manifest
    manifest_df = pd.DataFrame(manifest_rows)
    # Order columns
    cols = ["image_id", "image_path", "base_heatmap_path", "text_map_path", "face_map_path", 
            "object_map_path", "brightness_map_path", "contrast_map_path", "saturation_map_path", 
            "edge_map_path", "gt_saliency_path"]
    manifest_df = manifest_df[cols]
    manifest_path = os.path.join(base_dir, "feature_manifest.csv")
    manifest_df.to_csv(manifest_path, index=False)
    print(f"Feature manifest written to {manifest_path} with {len(manifest_df)} rows.")

if __name__ == "__main__":
    main()
