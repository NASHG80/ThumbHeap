# Integration Contract: Person B -> Person A (Fusion Network)

This contract defines the strict spatial feature expectations that Person A's Fusion Network can rely upon when consuming outputs from Person B's detection pipeline.

## Contract Guarantees

For every processed image (`<image_id>.npy`), the detection pipeline provides three independent feature maps:
1. `text_map`   → Shape: `(288, 384)`
2. `face_map`   → Shape: `(288, 384)`
3. `object_map` → Shape: `(288, 384)`

### Data Format
- **Dtype:** `np.float32`
- **Range:** Normalized strictly to `[0.0, 1.0]`
- **NaN/Inf:** Guaranteed to contain NO `NaN` or `Inf` values.

### Spatial Coordination
- **Direct Stretch Mapping:** The bounding boxes and heatmaps are stretched directly from the original image dimensions `(W, H)` to the target `(384, 288)` tensor. There is no aspect-ratio padding. This perfectly mirrors TranSalNet's default preprocessing distortion.
- **Image ID Matching:** Maps from different folders (`text_map`, `face_map`, `object_map`) that share the identical `<image_id>.npy` filename are guaranteed to correspond to the identical source image.

### Stacked Representation (Input to Fusion)
When stacking these maps, they form a standard multi-channel tensor:
```python
features = np.stack([text_map, face_map, object_map], axis=0)
# features.shape == (3, 288, 384)
```
- Channel 0: Text Features
- Channel 1: Face Features
- Channel 2: Object Features

### Semantics
These maps contain raw spatial feature confidence (e.g., probability of a face existing at a pixel). They are **NOT** final human-attention predictions. The Fusion Network must use these as intermediate features to train against empirical gaze data.
