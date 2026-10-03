import os
import sys
import cv2
import numpy as np
import torch
import time
import csv

# Add TranSalNet repo to Python path
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRANSALNET_DIR = os.path.join(ROOT, "models", "transalnet")
sys.path.append(TRANSALNET_DIR)

from TranSalNet_Dense import TranSalNet
from utils.data_process import preprocess_img

# --------------------------------------------------
# Paths
# --------------------------------------------------
MODEL_PATH = os.path.join(TRANSALNET_DIR, "pretrained_models", "TranSalNet_Dense.pth")
INPUT_DIR = os.path.join(ROOT, "data", "thumbnails")
OUTPUT_DIR = os.path.join(ROOT, "outputs", "heatmaps_dense")
CSV_PATH = os.path.join(ROOT, "outputs", "dense_inference_benchmark.csv")

# --------------------------------------------------
# Setup
# --------------------------------------------------
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

model = TranSalNet()
checkpoint = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(checkpoint)
model.to(device)
model.eval()

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)

# --------------------------------------------------
# Batch Processing
# --------------------------------------------------
valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}
image_files = []

if os.path.exists(INPUT_DIR):
    for f in os.listdir(INPUT_DIR):
        if os.path.splitext(f)[1].lower() in valid_extensions:
            image_files.append(f)

image_files.sort()
total_images = len(image_files)

print(f"Found {total_images} images to process in {INPUT_DIR}\n")

processed = 0
failed = 0
inference_times = []
results_csv_data = []

overall_start_time = time.time()

with torch.no_grad():
    for i, img_name in enumerate(image_files):
        img_path = os.path.join(INPUT_DIR, img_name)
        base_name = os.path.splitext(img_name)[0]
        out_name = f"{base_name}.png"
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
            pred_saliency = (pred_saliency * 255).clip(0, 255).astype(np.uint8)
            pred_saliency = cv2.resize(pred_saliency, (384, 288))
            
            # Save
            cv2.imwrite(out_path, pred_saliency)
            
            processed += 1
            inference_times.append(inf_time)
            results_csv_data.append([img_name, round(inf_time, 4), "success"])
            print(f"[{i+1}/{total_images}] {img_name} -> done")
            
        except Exception as e:
            failed += 1
            results_csv_data.append([img_name, 0.0, f"failed: {str(e)}"])
            print(f"[{i+1}/{total_images}] {img_name} -> FAILED ({e})")

overall_end_time = time.time()
total_time = overall_end_time - overall_start_time

avg_time = sum(inference_times) / len(inference_times) if inference_times else 0.0

# --------------------------------------------------
# Save Benchmark CSV
# --------------------------------------------------
with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["image_name", "inference_time_seconds", "status"])
    writer.writerows(results_csv_data)

# --------------------------------------------------
# Print Summary
# --------------------------------------------------
print("\n--- Summary ---")
print(f"Processed: {processed}")
print(f"Failed: {failed}")
print(f"Average inference time: {avg_time:.4f} seconds")
print(f"Total time: {total_time:.4f} seconds")
print(f"Results saved to {CSV_PATH}")
