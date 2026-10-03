# Fusion Network Experiment Results

This document summarizes the final experiment comparing the baseline TranSalNet-Res model against our newly trained Residual Fusion architecture.

## 1. Dataset Configuration
- **Dataset**: OSIE
- **Train Split**: 490 images
- **Validation Split**: 105 images
- **Test Split**: 105 images
- **Split Seed**: 42

## 2. Baseline Configuration
- **Model**: TranSalNet-Res
- **Type**: Pretrained model; not trained from scratch.
- **Evaluation**: Evaluated on the exact same 105-image OSIE test set.

## 3. Residual Fusion Configuration
A residual fusion approach was used where TranSalNet remains the primary saliency prediction, while the lightweight Fusion network learns a spatial correction (residual) using auxiliary contextual channels.

- **Architecture**: Residual Fusion
- **Input Channels (8)**: `base_heatmap`, `text_map`, `face_map`, `object_map`, `brightness_map`, `contrast_map`, `saturation_map`, `edge_map`
- **Output**: A single 288x384 attention heatmap.
- **Parameters**: 236,817
- **Best Epoch**: 48
- **Best Validation Loss**: 0.5274
- **Training Time**: 677.38 seconds

## 4. Final Test Results

Metric | TranSalNet | Residual Fusion | Relative Change
--- | --- | --- | ---
NSS | 2.696734 | 2.814389 | +4.36%
CC | 0.772825 | 0.797090 | +3.14%
SIM | 0.639205 | 0.660879 | +3.39%
KL | 0.496640 | 0.445162 | -10.37%
AUC | 0.903553 | 0.906450 | +0.32%

### Metric Explanations
- **NSS (Normalized Scanpath Saliency)**: Higher is better. Measures the average predicted saliency values at human fixation locations.
- **CC (Pearson's Correlation Coefficient)**: Higher is better. Measures the linear correlation between the predicted saliency map and ground truth.
- **SIM (Similarity)**: Higher is better. Measures the overlap between two probability distributions.
- **KL (Kullback-Leibler Divergence)**: Lower is better. Measures how the predicted distribution diverges from the ground truth distribution.
- **AUC (Area Under Curve)**: Higher is better. Measures the tradeoff between true positive rate and false positive rate.

### Conclusion
The Residual Fusion model performed better than the baseline TranSalNet on this held-out OSIE test set across every evaluated metric. By utilizing auxiliary semantic and low-level maps, the network successfully learned to apply structural and semantic spatial corrections to the base prediction.

**Important Domain Note**: OSIE is a general saliency dataset and is not a YouTube-thumbnail-specific gaze dataset. While the Residual Fusion architecture effectively improves generic saliency prediction, this does *not* inherently prove better YouTube-thumbnail performance yet. Adapting this model directly to the YouTube-thumbnail domain remains future work.

## 5. Visualizing the Comparisons

To visually inspect the qualitative differences between the models, run the following standalone visualization script:
```bash
python backend/fusion/generate_visual_comparisons.py
```
This script deterministically selects 5 test images (using the test split and seed 42) and generates side-by-side heatmaps saved in `backend/fusion/results/visual_comparisons/`. The script automatically loads the pretrained baseline and the best fusion checkpoint for direct, fair comparison.
