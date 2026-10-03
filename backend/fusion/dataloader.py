import os
import pandas as pd
from torch.utils.data import DataLoader
from dataset import FusionDataset

def get_dataloaders(base_dir, batch_size=16, num_workers=2):
    manifest_path = os.path.join(base_dir, "feature_manifest.csv")
    train_path = os.path.join(base_dir, "train.csv")
    val_path = os.path.join(base_dir, "val.csv")
    test_path = os.path.join(base_dir, "test.csv")
    
    manifest_df = pd.read_csv(manifest_path)
    train_df_ids = pd.read_csv(train_path)['image_id'].astype(str).tolist()
    val_df_ids = pd.read_csv(val_path)['image_id'].astype(str).tolist()
    test_df_ids = pd.read_csv(test_path)['image_id'].astype(str).tolist()
    
    manifest_df['image_id'] = manifest_df['image_id'].astype(str)
    
    train_df = manifest_df[manifest_df['image_id'].isin(train_df_ids)].reset_index(drop=True)
    val_df = manifest_df[manifest_df['image_id'].isin(val_df_ids)].reset_index(drop=True)
    test_df = manifest_df[manifest_df['image_id'].isin(test_df_ids)].reset_index(drop=True)
    
    train_dataset = FusionDataset(train_df, base_dir)
    val_dataset = FusionDataset(val_df, base_dir)
    test_dataset = FusionDataset(test_df, base_dir)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    
    return train_loader, val_loader, test_loader
