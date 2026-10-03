# OpenCV Feature Extractor

This module calculates deterministically generated spatial and scalar visual features for the thumbnail attention model. 

## Features

1. **Brightness Map (`brightness_map`)**
   - **Method**: Extract the `V` (Value) channel from the HSV color space representation of the image.
   - **Normalization**: Min-Max normalized to `[0, 1]`.
   - **Meaning**: Represents local luminance.

2. **Contrast Map (`contrast_map`)**
   - **Method**: Local standard deviation of the grayscale image. Uses a box filter (`cv2.blur`) to compute the local variance as `E[X^2] - (E[X])^2`.
   - **Parameters**: Window size = 11x11.
   - **Normalization**: Min-Max normalized to `[0, 1]`.
   - **Meaning**: Represents local intensity variations. Spatial variance helps the fusion network identify textured/high-contrast regions.

3. **Saturation Map (`saturation_map`)**
   - **Method**: Extract the `S` (Saturation) channel from the HSV color space representation.
   - **Normalization**: Min-Max normalized to `[0, 1]`.
   - **Meaning**: Represents color vibrancy, which is known to attract human attention.

4. **Edge Density Map (`edge_map`)**
   - **Method**: Gradient magnitude calculated via Sobel filters (kernel size=3) in X and Y directions. The resulting magnitude is smoothed with a box filter.
   - **Parameters**: `smooth_ksize=5`.
   - **Normalization**: Min-Max normalized to `[0, 1]`.
   - **Meaning**: Represents visual complexity and edge density, preventing sparse hard edges from being over-weighted.

## Data Contract
- **Shape**: `(288, 384)`
- **Dtype**: `float32`
- **Range**: `[0.0, 1.0]`

## Scalar Features
For every image, a summary CSV (`scalar_features/features.csv`) is generated with the spatial mean of the above four maps.

## Future Integration
The module contains a placeholder function `compute_region_statistics(feature_map, boxes)` intended to accept bounding boxes from Person B (PaddleOCR, YuNet, YOLO-World) later.
This helper does NOT depend on Person B's detection code or dependencies.

**Expected Bounding Box Format**:
The `boxes` argument must be a list of lists/tuples formatted as `[x1, y1, x2, y2]` where:
- `x1, y1` are the top-left coordinates.
- `x2, y2` are the bottom-right coordinates.
- Coordinates must be mapped to the `384x288` resolution.
