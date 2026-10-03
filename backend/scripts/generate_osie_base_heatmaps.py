import os
import sys
import cv2
import numpy as np
import torch
import time
import pandas as pd

# Add TranSalNet repo to Python path
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRANSALNET_DIR = os.path.join(ROOT, "models", "transalnet")
sys.path.append(TRANSALNET_DIR)

from TranSalNet_Res import TranSalNet
from utils.data_process import preprocess_img

def main():
    MODEL_PATH = os.path.join(TRANSALNET_DIR, "pretrained_models", "TranSalNet_Res.pth")
    MANIFEST_PATH = os.path.join(ROOT, "person_c", "data", "processed", "osie", "feature_manifest.csv")
    BASE_DIR = os.path.dirname(MANIFEST_PATH)
    OUTPUT_DIR = os.path.join(BASE_DIR, "base_heatmap")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print("Using device:", device)
    
    model = TranSalNet()
    checkpoint = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(checkpoint)
    model.to(device)
    model.eval()
    
    df = pd.read_csv(MANIFEST_PATH)
    total_images = len(df)
    
    processed = 0
    failed = 0
    inference_times = []
    failed_ids = []
    
    overall_start_time = time.time()
    
    with torch.no_grad():
        for idx, row in df.iterrows():
            img_id = str(row['image_id'])
            img_rel_path = row['image_path']
            img_path = os.path.join(BASE_DIR, img_rel_path)
            
            out_name = f"{img_id}.npy"
            out_path = os.path.join(OUTPUT_DIR, out_name)
            
            try:
                # Preprocess image
                img = preprocess_img(img_path)
                img = np.array(img) / 255.0
                img = np.transpose(img, (2, 0, 1))
                img = np.expand_dims(img, axis=0)
                img = torch.from_numpy(img).float().to(device)
                
                # Inference
                start_time = time.time()
                pred_saliency = model(img)
                inf_time = time.time() - start_time
                
                # Postprocess
                pred_saliency = pred_saliency.squeeze().cpu().numpy()
                pred_saliency = cv2.resize(pred_saliency, (384, 288), interpolation=cv2.INTER_LINEAR)
                
                # Min-max normalize to [0.0, 1.0]
                if pred_saliency.max() > pred_saliency.min():
                    pred_saliency = (pred_saliency - pred_saliency.min()) / (pred_saliency.max() - pred_saliency.min())
                else:
                    pred_saliency = np.zeros_like(pred_saliency)
                    
                pred_saliency = pred_saliency.astype(np.float32)
                
                # Save
                np.save(out_path, pred_saliency)
                
                # Update DataFrame
                df.at[idx, 'base_heatmap_path'] = f"base_heatmap/{out_name}"
                
                processed += 1
                inference_times.append(inf_time)
                print(f"[{processed + failed}/{total_images}] {img_id} -> success")
                
            except Exception as e:
                failed += 1
                failed_ids.append((img_id, str(e)))
                print(f"[{processed + failed}/{total_images}] {img_id} -> failed ({e})")
                
    overall_end_time = time.time()
    total_time = overall_end_time - overall_start_time
    avg_time = sum(inference_times) / len(inference_times) if inference_times else 0.0
    
    df.to_csv(MANIFEST_PATH, index=False)
    
    print("\n--- Summary ---")
    print(f"Processed: {processed}")
    print(f"Failed: {failed}")
    print(f"Average inference time: {avg_time:.4f} seconds")
    print(f"Total time: {total_time:.4f} seconds")
    print(f"Output directory: {OUTPUT_DIR}")
    print("Manifest updated: yes")
    
    if failed_ids:
        print("Failed IDs:")
        for fid, err in failed_ids:
            print(f"  {fid}: {err}")

if __name__ == "__main__":
    main()
