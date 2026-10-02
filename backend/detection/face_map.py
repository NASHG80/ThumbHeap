import os
import cv2
import json
import argparse
import numpy as np

def generate_face_map(image, detections, output_size=(384, 288)):
    """
    Generate a standardized face attention map (Gaussian heatmaps) from YuNet detections.
    
    Args:
        image: Original numpy image array (H, W, C).
        detections: NumPy array of shape [N, 15] from YuNet cv2.FaceDetectorYN.
        output_size: Tuple of (width, height) for the output map.
        
    Returns:
        face_map: NumPy array of shape (height, width), dtype float32, normalized to [0, 1].
        face_params: List of dictionaries containing parameters for each face.
    """
    orig_h, orig_w = image.shape[:2]
    out_w, out_h = output_size
    
    # Initialize an all-zero map of the target size and float32 dtype
    face_map = np.zeros((out_h, out_w), dtype=np.float32)
    face_params = []
    
    if detections is None or len(detections) == 0:
        return face_map, face_params
        
    # Coordinate scaling factors
    scale_x = out_w / float(orig_w)
    scale_y = out_h / float(orig_h)
    
    for face in detections:
        # YuNet face format: [x, y, w, h, ...]
        box = face[0:4]
        confidence = float(face[-1])
        
        orig_x, orig_y, orig_face_w, orig_face_h = box
        
        # Scale bounding box to output coordinates
        res_x = orig_x * scale_x
        res_y = orig_y * scale_y
        res_w = orig_face_w * scale_x
        res_h = orig_face_h * scale_y
        
        # Center of the face in output coordinates
        center_x = res_x + res_w / 2.0
        center_y = res_y + res_h / 2.0
        
        # Gaussian spread (sigma) proportional to face size.
        # A common heuristic is using a fraction of the bounding box size (e.g., width/4 and height/4)
        # so that ~95% of the gaussian blob falls within the bounding box.
        sigma_x = max(res_w / 4.0, 1.0)
        sigma_y = max(res_h / 4.0, 1.0)
        
        # Create a meshgrid for the output coordinate space
        y_indices, x_indices = np.mgrid[0:out_h, 0:out_w]
        
        # Calculate the 2D Gaussian blob
        # Formula: exp( - ( (x-cx)^2 / (2*sigma_x^2) + (y-cy)^2 / (2*sigma_y^2) ) )
        gaussian = np.exp(-(
            ((x_indices - center_x) ** 2) / (2.0 * sigma_x ** 2) + 
            ((y_indices - center_y) ** 2) / (2.0 * sigma_y ** 2)
        ))
        
        # Weight the blob by the YuNet confidence score
        weighted_gaussian = gaussian * confidence
        
        # Combine with the existing face_map (using maximum to avoid oversaturation 
        # when faces overlap, or addition. Max is usually preferred for heatmaps).
        face_map = np.maximum(face_map, weighted_gaussian)
        
        # Record parameters for verification
        face_params.append({
            "confidence": confidence,
            "original_bbox": [float(orig_x), float(orig_y), float(orig_face_w), float(orig_face_h)],
            "resized_bbox": [float(res_x), float(res_y), float(res_w), float(res_h)],
            "center": [float(center_x), float(center_y)],
            "sigma": [float(sigma_x), float(sigma_y)]
        })
        
    # Normalize the final combined map to strictly [0.0, 1.0]
    max_val = np.max(face_map)
    if max_val > 0:
        face_map = face_map / max_val
        
    return face_map.astype(np.float32), face_params

def overlay_heatmap(image, heatmap):
    """
    Overlay a heatmap (0-1 float32) onto an image.
    """
    # Resize heatmap to original image size for overlay
    h, w = image.shape[:2]
    heatmap_resized = cv2.resize(heatmap, (w, h))
    
    # Convert heatmap to 8-bit color map
    heatmap_8bit = np.uint8(255 * heatmap_resized)
    colormap = cv2.applyColorMap(heatmap_8bit, cv2.COLORMAP_JET)
    
    # Blend original image and colormap
    overlay = cv2.addWeighted(image, 0.6, colormap, 0.4, 0)
    return overlay

def main():
    parser = argparse.ArgumentParser(description="Generate Face Spatial Map")
    parser.add_argument("image_path", help="Path to the sample image")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        print(f"Error: Image '{args.image_path}' not found.")
        return

    # Prepare paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, "models", "yunet", "face_detection_yunet_2023mar.onnx")
    outputs_dir = os.path.join(base_dir, "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    
    out_npy_path = os.path.join(outputs_dir, "face_map_test.npy")
    out_img_path = os.path.join(outputs_dir, "face_map_test.jpg")
    out_json_path = os.path.join(outputs_dir, "face_map_test.json")

    # Load Image
    img = cv2.imread(args.image_path)
    if img is None:
        print(f"Error: Could not read image '{args.image_path}'")
        return
    
    orig_h, orig_w = img.shape[:2]
    print(f"Original image size: {orig_w}x{orig_h}")

    # Run YuNet Detection
    # Reusing initialization logic from test_yunet.py
    SCORE_THRESHOLD = 0.6
    NMS_THRESHOLD = 0.3
    TOP_K = 5000
    
    detector = cv2.FaceDetectorYN.create(
        model=model_path,
        config="",
        input_size=(orig_w, orig_h),
        score_threshold=SCORE_THRESHOLD,
        nms_threshold=NMS_THRESHOLD,
        top_k=TOP_K
    )
    
    status, faces = detector.detect(img)
    num_faces = faces.shape[0] if faces is not None else 0
    print(f"Detected {num_faces} faces.")
    
    # Generate Face Map
    target_size = (384, 288)
    face_map, face_params = generate_face_map(img, faces, output_size=target_size)
    
    print(f"Output map shape: {face_map.shape}")
    print(f"Output map dtype: {face_map.dtype}")
    print(f"Output map min/max: {np.min(face_map):.4f} / {np.max(face_map):.4f}")
    
    # Save the raw numpy array
    np.save(out_npy_path, face_map)
    print(f"Saved NumPy array to: {out_npy_path}")
    
    # Save parameters to JSON
    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(face_params, f, indent=4)
    print(f"Saved face parameters to: {out_json_path}")
    
    # Create and save visualization overlay
    overlay_img = overlay_heatmap(img, face_map)
    cv2.imwrite(out_img_path, overlay_img)
    print(f"Saved visualization to: {out_img_path}")
    
    # Print per-face sigma summary
    for i, p in enumerate(face_params):
        print(f"Face {i+1} - Confidence: {p['confidence']:.4f}, Sigma: [x={p['sigma'][0]:.2f}, y={p['sigma'][1]:.2f}]")

if __name__ == "__main__":
    main()
