import os
import sys
import cv2
import numpy as np
import torch

# Add TranSalNet repo to Python path
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRANSALNET_DIR = os.path.join(ROOT, "models", "transalnet")
sys.path.append(TRANSALNET_DIR)

from TranSalNet_Res import TranSalNet
from utils.data_process import preprocess_img, postprocess_img


# --------------------------------------------------
# Paths
# --------------------------------------------------

MODEL_PATH = os.path.join(
    TRANSALNET_DIR,
    "pretrained_models",
    "TranSalNet_Res.pth"
)

IMAGE_PATH = os.path.join(
    TRANSALNET_DIR,
    "example",
    "youtube_sample.jpg"
)

OUTPUT_PATH = os.path.join(
    ROOT,
    "outputs",
    "transalnet_result.png"
)


# --------------------------------------------------
# Device
# --------------------------------------------------

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

print("Using device:", device)


# --------------------------------------------------
# Load model
# --------------------------------------------------

model = TranSalNet()

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

model.load_state_dict(checkpoint)
model.to(device)
model.eval()


# --------------------------------------------------
# Preprocess image
# --------------------------------------------------

img = preprocess_img(IMAGE_PATH)

img = np.array(img) / 255.0
img = np.transpose(img, (2, 0, 1))
img = np.expand_dims(img, axis=0)

img = torch.from_numpy(img).float().to(device)


# --------------------------------------------------
# Inference
# --------------------------------------------------

with torch.no_grad():
    pred_saliency = model(img)


# --------------------------------------------------
# Convert prediction to image
# --------------------------------------------------

pred_saliency = pred_saliency.squeeze().cpu()

pred_saliency = pred_saliency.numpy()

pred_saliency = (pred_saliency * 255).clip(0, 255).astype(np.uint8)

pred_saliency = cv2.resize(
    pred_saliency,
    (384, 288)
)


# --------------------------------------------------
# Save
# --------------------------------------------------

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

cv2.imwrite(
    OUTPUT_PATH,
    pred_saliency
)

print("Finished!")
print("Output:", OUTPUT_PATH)