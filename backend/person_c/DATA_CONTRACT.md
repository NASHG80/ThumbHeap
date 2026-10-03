# Data Contract

### Spatial resolution
```text
Image/model resolution:
384 × 288

NumPy array shape:
(288, 384)
```

### Spatial map format
```text
dtype: float32
range: [0.0, 1.0]
format: .npy
```

### Required future map names
```text
base_heatmap/
text_map/
face_map/
object_map/
contrast_map/
brightness_map/
saturation_map/
edge_map/
gt_saliency/
```

### Scalar features
Stored separately as:
```text
scalar_features/features.csv
```

### Naming
Every component must use the same `image_id`.

Example:
```text
img001.jpg

base_heatmap/img001.npy
text_map/img001.npy
face_map/img001.npy
object_map/img001.npy
contrast_map/img001.npy
brightness_map/img001.npy
saturation_map/img001.npy
edge_map/img001.npy
gt_saliency/img001.npy
```
