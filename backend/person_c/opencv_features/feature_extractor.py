import cv2
import numpy as np

def normalize_map(m):
    """Deterministically normalizes a map to [0, 1]."""
    m = m.astype(np.float32)
    min_val = m.min()
    max_val = m.max()
    if max_val - min_val > 0:
        return (m - min_val) / (max_val - min_val)
    return np.zeros_like(m, dtype=np.float32)

def load_image(path, target_size=(384, 288)):
    """Loads an image and resizes it to the target resolution."""
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Could not read image: {path}")
    img_resized = cv2.resize(img, target_size, interpolation=cv2.INTER_LINEAR)
    return img_resized

def compute_brightness_map(img):
    """Computes brightness (luminance) using the V channel of HSV."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    v_channel = hsv[:, :, 2]
    return normalize_map(v_channel)

def compute_saturation_map(img):
    """Computes saturation using the S channel of HSV."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    s_channel = hsv[:, :, 1]
    return normalize_map(s_channel)

def compute_contrast_map(img, kernel_size=11):
    """Computes local contrast as the local standard deviation."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    local_mean = cv2.blur(gray, (kernel_size, kernel_size))
    local_sq_mean = cv2.blur(gray**2, (kernel_size, kernel_size))
    # std = sqrt(E[X^2] - (E[X])^2)
    local_var = local_sq_mean - local_mean**2
    local_var[local_var < 0] = 0
    local_std = np.sqrt(local_var)
    return normalize_map(local_std)

def compute_edge_map(img, smooth_ksize=5):
    """Computes edge density / visual complexity using smoothed gradient magnitude."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    mag = np.sqrt(gx**2 + gy**2)
    # Smooth the magnitude to create a density map instead of hard edges
    if smooth_ksize > 0:
        mag = cv2.blur(mag, (smooth_ksize, smooth_ksize))
    return normalize_map(mag)

def compute_scalar_features(brightness_map, contrast_map, saturation_map, edge_map):
    """Computes scalar summary features for the image."""
    return {
        "mean_brightness": float(np.mean(brightness_map)),
        "mean_contrast": float(np.mean(contrast_map)),
        "mean_saturation": float(np.mean(saturation_map)),
        "edge_density": float(np.mean(edge_map))
    }

def compute_region_statistics(feature_map, boxes):
    """
    Placeholder for Person B integration (PaddleOCR, YuNet, YOLO-World).
    boxes: list of [x1, y1, x2, y2]
    """
    stats = []
    h, w = feature_map.shape
    total_area = h * w
    for box in boxes:
        x1, y1, x2, y2 = map(int, box)
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        
        region = feature_map[y1:y2, x1:x2]
        area = (x2 - x1) * (y2 - y1)
        mean_val = float(np.mean(region)) if area > 0 else 0.0
        
        stats.append({
            "mean": mean_val,
            "area": area,
            "normalized_area": area / total_area if total_area > 0 else 0,
            "center_x": (x1 + x2) / 2.0,
            "center_y": (y1 + y2) / 2.0,
            "width": x2 - x1,
            "height": y2 - y1
        })
    return stats
