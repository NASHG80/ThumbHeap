# Fusion Network

## 1. Fusion Architecture
The Fusion Network is a lightweight U-Net style model consisting of an encoder with 3 convolution stages and 2 MaxPool layers, followed by a decoder with 2 Transposed Convolutions and concatenating skip connections. The model takes in 8 spatial maps and outputs a single combined saliency map bounded in [0, 1] using Sigmoid.

## 2. Input Channels (Exact Order)
1. `base_heatmap_path` (TranSalNet-Res output)
2. `text_map_path` (PaddleOCR context)
3. `face_map_path` (YuNet context)
4. `object_map_path` (YOLO-World context)
5. `brightness_map_path` (OpenCV)
6. `contrast_map_path` (OpenCV)
7. `saturation_map_path` (OpenCV)
8. `edge_map_path` (OpenCV)

## 3. Target
- `gt_saliency` (Continuous float32 [0,1] map). Fixations are loaded for evaluation metrics (AUC, NSS).

## 4-6. Data Splits
- **Training**: 490 images
- **Validation**: 105 images
- **Test**: 105 images
Split manifests are natively maintained in `backend/person_c/data/processed/osie/`.

## 7. Optimizer
- AdamW (Adaptive Moment Estimation with Weight Decay)

## 8. Loss
- Combination of Kullback-Leibler (KL) Divergence and Pearson Correlation Coefficient (CC) Loss.
- `total_loss = kl_loss + 0.5 * correlation_loss`

## 9. Training Configuration
- Batch Size: 16
- Learning Rate: 1e-4
- Epochs: 50
- Weight Decay: 1e-4
- Patience: 7
- Seed: 42

## 10. How to Run Training
```bash
python backend/fusion/train.py
```
*(Training is not yet executed)*

## 11. How to Run Evaluation
```bash
python backend/fusion/evaluate.py
```
*(Evaluation requires a trained model and is not yet executed)*

## 12. Checkpoint Location
- `backend/fusion/checkpoints/best_fusion.pth`
- `backend/fusion/checkpoints/training_history.csv`

## 13. Result Locations
- `backend/fusion/results/model_comparison.csv`
- `backend/fusion/results/per_image_metrics.csv`
