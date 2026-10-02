import os
import glob
import csv
import sys
import numpy as np

# Add parent directory to sys.path to import the module
script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(script_dir, ".."))
sys.path.append(parent_dir)

from opencv_features.feature_extractor import (
    load_image, compute_brightness_map, compute_contrast_map,
    compute_saturation_map, compute_edge_map, compute_scalar_features
)

def main():
    base_data = os.path.join(parent_dir, "data", "processed", "osie")
    images_dir = os.path.join(base_data, "images")
    
    out_dirs = {
        "brightness": os.path.join(base_data, "brightness_map"),
        "contrast": os.path.join(base_data, "contrast_map"),
        "saturation": os.path.join(base_data, "saturation_map"),
        "edge": os.path.join(base_data, "edge_map"),
        "scalar": os.path.join(base_data, "scalar_features")
    }
    
    # 1. Discover all 700 processed OSIE images
    image_paths = glob.glob(os.path.join(images_dir, "*.jpg"))
    if len(image_paths) != 700:
        print(f"Warning: Expected 700 images, found {len(image_paths)}")
    
    csv_rows = []
    
    # 2. Process every image
    for path in image_paths:
        image_id = os.path.splitext(os.path.basename(path))[0]
        try:
            img = load_image(path, target_size=(384, 288))
            
            b_map = compute_brightness_map(img)
            c_map = compute_contrast_map(img)
            s_map = compute_saturation_map(img)
            e_map = compute_edge_map(img)
            
            scalars = compute_scalar_features(b_map, c_map, s_map, e_map)
            scalars["image_id"] = image_id
            csv_rows.append(scalars)
            
            # 3. Generate spatial maps
            np.save(os.path.join(out_dirs["brightness"], f"{image_id}.npy"), b_map)
            np.save(os.path.join(out_dirs["contrast"], f"{image_id}.npy"), c_map)
            np.save(os.path.join(out_dirs["saturation"], f"{image_id}.npy"), s_map)
            np.save(os.path.join(out_dirs["edge"], f"{image_id}.npy"), e_map)
            
        except Exception as e:
            print(f"Failed to process {image_id}: {e}")
            
    # 4. Generate scalar_features/features.csv
    csv_path = os.path.join(out_dirs["scalar"], "features.csv")
    with open(csv_path, "w", newline="") as f:
        fieldnames = ["image_id", "mean_brightness", "mean_contrast", "mean_saturation", "edge_density"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        # Sort by image_id for deterministic output
        csv_rows.sort(key=lambda x: x["image_id"])
        for row in csv_rows:
            writer.writerow(row)
            
    print(f"Processed {len(csv_rows)} images. Saved features.csv")

if __name__ == "__main__":
    main()
