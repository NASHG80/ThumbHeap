import os
import numpy as np
import matplotlib.pyplot as plt
import cv2

def visualize(image_id="1001"):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.abspath(os.path.join(script_dir, ".."))
    base_data = os.path.join(parent_dir, "data", "processed", "osie")
    
    img_path = os.path.join(base_data, "images", f"{image_id}.jpg")
    if not os.path.exists(img_path):
        print(f"Image {img_path} not found.")
        return
        
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (384, 288))
    
    b_map = np.load(os.path.join(base_data, "brightness_map", f"{image_id}.npy"))
    c_map = np.load(os.path.join(base_data, "contrast_map", f"{image_id}.npy"))
    s_map = np.load(os.path.join(base_data, "saturation_map", f"{image_id}.npy"))
    e_map = np.load(os.path.join(base_data, "edge_map", f"{image_id}.npy"))
    
    plt.figure(figsize=(20, 4))
    
    plt.subplot(1, 5, 1)
    plt.title("Original Thumbnail")
    plt.imshow(img)
    plt.axis("off")
    
    plt.subplot(1, 5, 2)
    plt.title("Brightness Map")
    plt.imshow(b_map, cmap="gray")
    plt.axis("off")
    
    plt.subplot(1, 5, 3)
    plt.title("Contrast Map")
    plt.imshow(c_map, cmap="gray")
    plt.axis("off")
    
    plt.subplot(1, 5, 4)
    plt.title("Saturation Map")
    plt.imshow(s_map, cmap="gray")
    plt.axis("off")
    
    plt.subplot(1, 5, 5)
    plt.title("Edge Map")
    plt.imshow(e_map, cmap="gray")
    plt.axis("off")
    
    out_dir = os.path.join(parent_dir, "outputs")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"vis_features_{image_id}.png")
    plt.tight_layout()
    plt.savefig(out_path)
    print(f"Saved visualization to {out_path}")

if __name__ == "__main__":
    visualize("1001")
