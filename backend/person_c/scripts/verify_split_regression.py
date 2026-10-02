import os
import pandas as pd

def main():
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "processed", "osie")
    
    manifest_path = os.path.join(base_dir, "feature_manifest.csv")
    if not os.path.exists(manifest_path):
        print(f"Error: {manifest_path} not found.")
        return
        
    manifest_df = pd.read_csv(manifest_path)
    manifest_ids = set(manifest_df['image_id'].astype(str))
    
    splits = ["train.csv", "val.csv", "test.csv"]
    
    all_split_ids = []
    
    for split in splits:
        split_path = os.path.join(base_dir, split)
        if not os.path.exists(split_path):
            print(f"Warning: {split_path} not found.")
            continue
            
        split_df = pd.read_csv(split_path)
        split_ids = list(split_df['image_id'].astype(str))
        all_split_ids.extend(split_ids)
        
        missing = set(split_ids) - manifest_ids
        if missing:
            print(f"Error: {len(missing)} IDs in {split} are missing from the feature manifest: {missing}")
        else:
            print(f"Pass: All {len(split_ids)} IDs in {split} exist in the feature manifest.")
            
    # Check for overlaps
    if len(all_split_ids) != len(set(all_split_ids)):
        print("Error: Overlap detected between splits.")
    else:
        print("Pass: No overlap between train/val/test splits.")

if __name__ == "__main__":
    main()
