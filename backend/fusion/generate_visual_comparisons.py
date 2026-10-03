import os
import sys
import torch
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

# Add root backend paths to import models correctly
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT)

import config
from model import FusionNetwork
from dataloader import get_dataloaders

def main():
    print("--- Generating Visual Comparisons ---")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 1. Load trained Residual Fusion Model
    print("Loading Fusion Model...")
    fusion_model = FusionNetwork().to(device)
    ckpt_path = os.path.join(config.CHECKPOINT_DIR, "best_fusion.pth")
    fusion_model.load_state_dict(torch.load(ckpt_path, map_location=device, weights_only=False)['model_state_dict'])
    fusion_model.eval()
    
    # 2. Retrieve deterministic OSIE test split (loader applies seed 42 automatically)
    print("Loading Test Split...")
    _, _, test_loader = get_dataloaders(config.DATA_BASE_DIR, batch_size=1, num_workers=0)
    
    out_dir = os.path.join(config.RESULTS_DIR, "visual_comparisons")
    os.makedirs(out_dir, exist_ok=True)
    
    # 3. Generate Visualizations for 5 images
    with torch.no_grad():
        for i, batch in enumerate(test_loader):
            if i >= 5:
                break
                
            img_id = batch['image_id'][0]
            print(f"Processing image {img_id}...")
            
            # Retrieve Original Image to preserve aspect ratio display
            img_path = os.path.join(config.DATA_BASE_DIR, "images", f"{img_id}.jpg")
            orig_img = Image.open(img_path).convert('RGB')
            orig_arr = np.array(orig_img)
            
            # The DataLoader explicitly reads feature_manifest.csv and loads the paths
            X = batch['X']
            Y = batch['Y']
            
            # Retrieve Ground Truth Saliency (loaded via gt_saliency_path in manifest)
            gt_saliency = Y[0, 0].cpu().numpy()
            
            # Forward Pass: Residual Fusion
            X_dev = X.to(device)
            fusion_pred = fusion_model(X_dev)
            fusion_heatmap = fusion_pred[0, 0].cpu().numpy()
            
            # The TranSalNet panel uses the previously generated, validated base heatmap 
            # instead of rerunning TranSalNet, because this guarantees the exact same 
            # baseline prediction used by the Fusion pipeline while avoiding unnecessary 
            # legacy-environment dependencies (e.g. Scipy/skimage DLL issues).
            # Channel 0 of X is exactly the loaded base_heatmap_path .npy file from the manifest.
            tsn_heatmap = X[0, 0].cpu().numpy()
            
            # Validation checks
            assert tsn_heatmap.shape == (288, 384), f"TranSalNet base heatmap shape mismatch: {tsn_heatmap.shape}"
            assert gt_saliency.shape == (288, 384), f"Ground truth shape mismatch: {gt_saliency.shape}"
            assert fusion_pred.shape == (1, 1, 288, 384), f"Fusion output shape mismatch: {fusion_pred.shape}"
            assert np.isfinite(tsn_heatmap).all(), "TranSalNet map contains NaN/Inf"
            assert np.isfinite(gt_saliency).all(), "Ground truth map contains NaN/Inf"
            assert np.isfinite(fusion_heatmap).all(), "Fusion map contains NaN/Inf"
            
            # Build Matplotlib figure
            fig, axes = plt.subplots(1, 4, figsize=(20, 5))
            
            axes[0].imshow(orig_arr)
            axes[0].set_title(f"Original Image ({img_id})")
            axes[0].axis('off')
            
            # Using vmin=0, vmax=1 to explicitly display in [0,1] range
            axes[1].imshow(tsn_heatmap, cmap='jet', vmin=0.0, vmax=1.0)
            axes[1].set_title("TranSalNet-Res (Baseline)")
            axes[1].axis('off')
            
            axes[2].imshow(fusion_heatmap, cmap='jet', vmin=0.0, vmax=1.0)
            axes[2].set_title("Residual Fusion")
            axes[2].axis('off')
            
            axes[3].imshow(gt_saliency, cmap='jet', vmin=0.0, vmax=1.0)
            axes[3].set_title("Ground Truth (OSIE)")
            axes[3].axis('off')
            
            plt.tight_layout()
            out_file = os.path.join(out_dir, f"comparison_{img_id}.png")
            plt.savefig(out_file, dpi=150)
            plt.close()
            
    print(f"Finished! Visualizations saved to {out_dir}")

if __name__ == "__main__":
    main()
