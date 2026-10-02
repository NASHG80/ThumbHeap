import os
import glob
import csv
import numpy as np

def verify():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.abspath(os.path.join(script_dir, ".."))
    base_data = os.path.join(parent_dir, "data", "processed", "osie")
    
    dirs = {
        "brightness": os.path.join(base_data, "brightness_map"),
        "contrast": os.path.join(base_data, "contrast_map"),
        "saturation": os.path.join(base_data, "saturation_map"),
        "edge": os.path.join(base_data, "edge_map"),
    }
    
    # 1. Check counts
    for name, d in dirs.items():
        files = glob.glob(os.path.join(d, "*.npy"))
        assert len(files) == 700, f"Expected 700 {name} maps, got {len(files)}"
        
        for f in files:
            arr = np.load(f)
            assert arr.shape == (288, 384), f"{name} shape mismatch: {arr.shape}"
            assert arr.dtype == np.float32, f"{name} dtype mismatch: {arr.dtype}"
            assert np.all(np.isfinite(arr)), f"{name} has NaNs or Infs"
            assert arr.min() >= 0.0, f"{name} min < 0: {arr.min()}"
            assert arr.max() <= 1.0, f"{name} max > 1: {arr.max()}"

    # 2. Check CSV
    csv_path = os.path.join(base_data, "scalar_features", "features.csv")
    assert os.path.exists(csv_path), "features.csv missing"
    
    ids = []
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ids.append(row["image_id"])
            for key in ["mean_brightness", "mean_contrast", "mean_saturation", "edge_density"]:
                val = float(row[key])
                assert np.isfinite(val), f"NaN/Inf in {key} for {row['image_id']}"
                
    assert len(ids) == 700, f"Expected 700 CSV rows, got {len(ids)}"
    assert len(set(ids)) == 700, "Duplicate IDs in CSV"
    
    print("Verification passed! All spatial maps and scalar features are correct.")

if __name__ == "__main__":
    verify()
