import os
import csv

def verify_split():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    
    base_data = os.path.join(project_root, "backend", "person_c", "data", "processed", "osie")
    
    def read_csv(filename):
        ids = []
        with open(os.path.join(base_data, filename), 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                ids.append(row['image_id'])
                # verify files exist
                assert os.path.exists(os.path.join(base_data, row['image_path'])), f"Missing {row['image_path']}"
                assert os.path.exists(os.path.join(base_data, row['gt_saliency_path'])), f"Missing {row['gt_saliency_path']}"
                assert os.path.exists(os.path.join(base_data, row['gt_fixation_path'])), f"Missing {row['gt_fixation_path']}"
        return ids

    train_ids = read_csv('train.csv')
    val_ids = read_csv('val.csv')
    test_ids = read_csv('test.csv')
    
    assert len(train_ids) == 490, f"Expected 490 train, got {len(train_ids)}"
    assert len(val_ids) == 105, f"Expected 105 val, got {len(val_ids)}"
    assert len(test_ids) == 105, f"Expected 105 test, got {len(test_ids)}"
    
    all_ids = train_ids + val_ids + test_ids
    assert len(all_ids) == 700, f"Total IDs should be 700, got {len(all_ids)}"
    assert len(set(all_ids)) == 700, "Duplicate IDs found across splits"
    
    print("Verification passed! All splits are correct and files exist.")

if __name__ == "__main__":
    verify_split()
