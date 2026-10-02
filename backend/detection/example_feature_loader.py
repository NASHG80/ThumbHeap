import os
import numpy as np

def load_person_b_features(base_dir, image_id):
    """
    Example loader demonstrating how Person A (Fusion Network) 
    can consume Person B's detection pipeline outputs.
    
    Args:
        base_dir (str): Base directory containing the generated maps (e.g., outputs/unified_detection_test)
        image_id (str): The filename stem of the image (e.g., 'thumbnail_01')
        
    Returns:
        np.ndarray: Stacked features of shape (3, 288, 384) in float32 format.
    """
    
    # 1. Locate individual map files
    text_map_path = os.path.join(base_dir, "text_map", f"{image_id}.npy")
    face_map_path = os.path.join(base_dir, "face_map", f"{image_id}.npy")
    object_map_path = os.path.join(base_dir, "object_map", f"{image_id}.npy")
    
    # 2. Load the maps (they are already guaranteed to be 288x384 float32)
    text_map = np.load(text_map_path)
    face_map = np.load(face_map_path)
    object_map = np.load(object_map_path)
    
    # 3. Stack them into a single tensor
    # The standard ordering contract for Fusion is:
    # Channel 0: Text, Channel 1: Face, Channel 2: Object
    features = np.stack([text_map, face_map, object_map], axis=0)
    
    return features

if __name__ == "__main__":
    # Example usage:
    # Assuming pipeline ran and saved to 'outputs/unified_detection_test'
    test_dir = os.path.join("..", "outputs", "unified_detection_test")
    test_id = "Screenshot 2026-10-03 011956"
    
    if os.path.exists(test_dir):
        try:
            tensor = load_person_b_features(test_dir, test_id)
            print(f"Successfully loaded feature tensor for '{test_id}'.")
            print(f"Tensor Shape: {tensor.shape}")
            print(f"Tensor Dtype: {tensor.dtype}")
        except FileNotFoundError as e:
            print(f"Could not find generated maps: {e}")
    else:
        print(f"Test directory {test_dir} not found. Please run the detection pipeline first.")
