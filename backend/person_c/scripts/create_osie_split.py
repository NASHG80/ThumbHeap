import os
import glob
import numpy as np
import csv

def create_split():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    
    base_data = os.path.join(project_root, "backend", "person_c", "data", "processed", "osie")
    images_dir = os.path.join(base_data, "images")
    
    # 1. Discover 700 processed images
    image_paths = glob.glob(os.path.join(images_dir, "*.jpg"))
    if len(image_paths) != 700:
        print(f"Error: Expected 700 images, found {len(image_paths)}")
        return
        
    image_ids = sorted([os.path.splitext(os.path.basename(p))[0] for p in image_paths])
    
    # 3. Create deterministic split with seed 42
    rng = np.random.default_rng(42)
    shuffled_ids = image_ids.copy()
    rng.shuffle(shuffled_ids)
    
    train_ids = shuffled_ids[:490]
    val_ids = shuffled_ids[490:490+105]
    test_ids = shuffled_ids[490+105:]
    
    # 4. Write CSVs
    def write_csv(filename, ids):
        filepath = os.path.join(base_data, filename)
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['image_id', 'image_path', 'gt_saliency_path', 'gt_fixation_path'])
            for img_id in ids:
                writer.writerow([
                    img_id,
                    f"images/{img_id}.jpg",
                    f"gt_saliency/{img_id}.npy",
                    f"gt_fixation/{img_id}.npy"
                ])
                
    write_csv('train.csv', train_ids)
    write_csv('val.csv', val_ids)
    write_csv('test.csv', test_ids)
    
    # 5. Print stats
    print(f"Train: {len(train_ids)}")
    print(f"Validation: {len(val_ids)}")
    print(f"Test: {len(test_ids)}")
    overlap = len(set(train_ids) & set(val_ids)) + len(set(train_ids) & set(test_ids)) + len(set(val_ids) & set(test_ids))
    print(f"Overlap: {overlap}")
    
    missing_targets = 0
    for img_id in image_ids:
        if not os.path.exists(os.path.join(base_data, "gt_saliency", f"{img_id}.npy")):
            missing_targets += 1
        if not os.path.exists(os.path.join(base_data, "gt_fixation", f"{img_id}.npy")):
            missing_targets += 1
    print(f"Missing targets: {missing_targets}")

if __name__ == "__main__":
    create_split()
