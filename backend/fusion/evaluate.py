import os
import torch
import numpy as np
import pandas as pd

import config
from model import FusionNetwork
from dataloader import get_dataloaders

def normalize_map(m):
    m_min, m_max = m.min(), m.max()
    if m_max > m_min:
        return (m - m_min) / (m_max - m_min)
    return torch.zeros_like(m)

def metric_cc(pred, gt):
    pred = normalize_map(pred)
    gt = normalize_map(gt)
    p_mean = pred.mean()
    g_mean = gt.mean()
    p_zero = pred - p_mean
    g_zero = gt - g_mean
    cov = (p_zero * g_zero).sum()
    std = torch.sqrt((p_zero**2).sum()) * torch.sqrt((g_zero**2).sum())
    if std == 0: return 0.0
    return (cov / std).item()

def metric_sim(pred, gt):
    pred = pred / (pred.sum() + 1e-7)
    gt = gt / (gt.sum() + 1e-7)
    return torch.min(pred, gt).sum().item()

def metric_kl(pred, gt):
    pred = pred / (pred.sum() + 1e-7)
    gt = gt / (gt.sum() + 1e-7)
    eps = 1e-7
    return (gt * torch.log(gt / (pred + eps) + eps)).sum().item()

def metric_nss(pred, fixations):
    if fixations.sum() == 0: return 0.0
    pred_norm = (pred - pred.mean()) / (pred.std() + 1e-7)
    return (pred_norm[fixations > 0]).mean().item()

def metric_auc(pred, fixations):
    if fixations.sum() == 0: return 0.0
    pred_flat = pred.flatten()
    fix_flat = fixations.flatten()
    
    sorted_inds = torch.argsort(pred_flat, descending=True)
    fix_sorted = fix_flat[sorted_inds]
    
    tp = torch.cumsum(fix_sorted, dim=0)
    fp = torch.cumsum(1 - fix_sorted, dim=0)
    
    tpr = tp / (tp[-1] + 1e-7)
    fpr = fp / (fp[-1] + 1e-7)
    
    auc = torch.trapz(tpr, fpr).item()
    return auc

def main():
    print("--- Starting Evaluation ---")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    _, _, test_loader = get_dataloaders(config.DATA_BASE_DIR, batch_size=1)
    
    model = FusionNetwork().to(device)
    ckpt_path = os.path.join(config.CHECKPOINT_DIR, "best_fusion.pth")
    if not os.path.exists(ckpt_path):
        print(f"Error: Checkpoint {ckpt_path} not found.")
        return
        
    model.load_state_dict(torch.load(ckpt_path, map_location=device, weights_only=False)['model_state_dict'])
    model.eval()
    
    test_df = pd.read_csv(os.path.join(config.DATA_BASE_DIR, "test.csv"))
    test_df['image_id'] = test_df['image_id'].astype(str)
    
    results = []
    
    with torch.no_grad():
        for i, batch in enumerate(test_loader):
            img_id = batch['image_id'][0]
            X = batch['X'].to(device)
            Y = batch['Y'].to(device)
            
            # Predict
            pred_fusion = model(X)
            
            # Baseline is base_heatmap (channel 0 in X)
            pred_baseline = X[:, 0:1, :, :]
            
            # Get fixations manually for NSS and AUC
            row = test_df[test_df['image_id'] == img_id].iloc[0]
            fix_path = os.path.join(config.DATA_BASE_DIR, row['gt_fixation_path'])
            if os.path.exists(fix_path):
                fix_arr = np.load(fix_path).astype(np.float32)
                fix = torch.from_numpy(fix_arr).unsqueeze(0).unsqueeze(0).to(device)
            else:
                fix = torch.zeros_like(Y)
            
            p_f = pred_fusion[0,0]
            p_b = pred_baseline[0,0]
            g_s = Y[0,0]
            g_f = fix[0,0]
            
            res_fusion = {
                'image_id': img_id,
                'model': 'Fusion',
                'NSS': metric_nss(p_f, g_f),
                'CC': metric_cc(p_f, g_s),
                'SIM': metric_sim(p_f, g_s),
                'KL': metric_kl(p_f, g_s),
                'AUC': metric_auc(p_f, g_f)
            }
            
            res_baseline = {
                'image_id': img_id,
                'model': 'TranSalNet',
                'NSS': metric_nss(p_b, g_f),
                'CC': metric_cc(p_b, g_s),
                'SIM': metric_sim(p_b, g_s),
                'KL': metric_kl(p_b, g_s),
                'AUC': metric_auc(p_b, g_f)
            }
            
            results.append(res_baseline)
            results.append(res_fusion)
            
    df_results = pd.DataFrame(results)
    df_results.to_csv(os.path.join(config.RESULTS_DIR, "per_image_metrics.csv"), index=False)
    
    # Aggregate
    agg = df_results.groupby('model')[['NSS', 'CC', 'SIM', 'KL', 'AUC']].mean().reset_index()
    agg.to_csv(os.path.join(config.RESULTS_DIR, "model_comparison.csv"), index=False)
    
    print("\n--- Final Model Comparison ---")
    print(agg.to_string(index=False))
    print(f"\nSaved results to {config.RESULTS_DIR}")

if __name__ == "__main__":
    main()
