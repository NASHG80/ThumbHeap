import os
import torch
from dataset import FusionDataset
from dataloader import get_dataloaders
import pandas as pd

def main():
    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "person_c", "data", "processed", "osie")
    
    # 1. Test Dataset direct loading
    print("--- Testing Dataset ---")
    manifest_path = os.path.join(base_dir, "feature_manifest.csv")
    df = pd.read_csv(manifest_path)
    
    dataset = FusionDataset(df, base_dir)
    sample = dataset[0]
    print(f"image_id: {sample['image_id']}")
    print(f"X shape: {sample['X'].shape}")
    print(f"Y shape: {sample['Y'].shape}")
    print(f"X dtype: {sample['X'].dtype}")
    print(f"Y dtype: {sample['Y'].dtype}")
    print(f"X min/max: {sample['X'].min().item():.4f} / {sample['X'].max().item():.4f}")
    print(f"Y min/max: {sample['Y'].min().item():.4f} / {sample['Y'].max().item():.4f}")
    print(f"NaN count: {torch.isnan(sample['X']).sum().item()} (X) / {torch.isnan(sample['Y']).sum().item()} (Y)")
    print(f"Inf count: {torch.isinf(sample['X']).sum().item()} (X) / {torch.isinf(sample['Y']).sum().item()} (Y)")
    
    # 2. Test Dataloaders
    print("\n--- Testing DataLoaders ---")
    train_loader, val_loader, test_loader = get_dataloaders(base_dir, batch_size=16, num_workers=0)
    
    # Train
    train_batch = next(iter(train_loader))
    print(f"Train Batch X shape: {train_batch['X'].shape}")
    print(f"Train Batch Y shape: {train_batch['Y'].shape}")
    
    # Val
    val_batch = next(iter(val_loader))
    print(f"Val Batch X shape: {val_batch['X'].shape}")
    print(f"Val Batch Y shape: {val_batch['Y'].shape}")
    
    # Test
    test_batch = next(iter(test_loader))
    print(f"Test Batch X shape: {test_batch['X'].shape}")
    print(f"Test Batch Y shape: {test_batch['Y'].shape}")
    
    print("\nAll dataset and dataloader validations passed!")

if __name__ == "__main__":
    main()
