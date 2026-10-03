import os
import torch
from torch.utils.data import Dataset
import numpy as np

class FusionDataset(Dataset):
    def __init__(self, manifest_df, base_dir):
        self.df = manifest_df
        self.base_dir = base_dir
        self.channels = [
            "base_heatmap_path",
            "text_map_path",
            "face_map_path",
            "object_map_path",
            "brightness_map_path",
            "contrast_map_path",
            "saturation_map_path",
            "edge_map_path"
        ]
        
    def __len__(self):
        return len(self.df)
        
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        image_id = str(row['image_id'])
        
        # Load 8 channels
        channel_arrays = []
        for col in self.channels:
            path = os.path.join(self.base_dir, str(row[col]))
            arr = np.load(path).astype(np.float32)
            
            # Verify
            if arr.shape != (288, 384):
                raise ValueError(f"Shape error in {col} for {image_id}")
            if arr.min() < 0.0 or arr.max() > 1.0001:
                raise ValueError(f"Range error in {col} for {image_id}")
            if np.isnan(arr).any() or np.isinf(arr).any():
                raise ValueError(f"NaN/Inf error in {col} for {image_id}")
                
            channel_arrays.append(arr)
            
        X = np.stack(channel_arrays, axis=0)
        X_tensor = torch.from_numpy(X).float()
        
        # Load gt_saliency
        gt_path = os.path.join(self.base_dir, str(row['gt_saliency_path']))
        gt_arr = np.load(gt_path).astype(np.float32)
        if gt_arr.shape != (288, 384):
            raise ValueError(f"Shape error in gt_saliency for {image_id}")
        if gt_arr.min() < 0.0 or gt_arr.max() > 1.0001:
            raise ValueError(f"Range error in gt_saliency for {image_id}")
        if np.isnan(gt_arr).any() or np.isinf(gt_arr).any():
            raise ValueError(f"NaN/Inf error in gt_saliency for {image_id}")
            
        Y_tensor = torch.from_numpy(gt_arr).unsqueeze(0).float()
        
        return {
            'image_id': image_id,
            'X': X_tensor,
            'Y': Y_tensor
        }
