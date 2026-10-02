import os
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

def visualize_saliency(img_id, stimuli_dir, orig_sal_dir, gt_sal_dir):
    img_path = os.path.join(stimuli_dir, img_id)
    if not os.path.exists(img_path):
        print(f"Image not found: {img_path}")
        return
        
    img = Image.open(img_path)
    base_name = os.path.splitext(img_id)[0]
    
    orig_sal = np.load(os.path.join(orig_sal_dir, f"{base_name}.npy"))
    gt_sal = np.load(os.path.join(gt_sal_dir, f"{base_name}.npy"))
    
    plt.figure(figsize=(15, 5))
    
    plt.subplot(1, 4, 1)
    plt.title("Original Image")
    plt.imshow(img)
    plt.axis('off')
    
    plt.subplot(1, 4, 2)
    plt.title("Original Saliency (600x800)")
    plt.imshow(orig_sal, cmap='jet')
    plt.axis('off')
    
    plt.subplot(1, 4, 3)
    plt.title("GT Saliency (288x384)")
    plt.imshow(gt_sal, cmap='jet')
    plt.axis('off')
    
    plt.subplot(1, 4, 4)
    plt.title("Overlay on GT")
    # Resize image to match GT for overlay
    img_resized = img.resize((384, 288))
    plt.imshow(img_resized)
    plt.imshow(gt_sal, cmap='jet', alpha=0.5)
    plt.axis('off')
    
    # Save the plot
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(script_dir, "..", "outputs", f"vis_{base_name}.png")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    plt.tight_layout()
    plt.savefig(out_path)
    print(f"Saved visualization to {out_path}")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    
    stim_dir = os.path.join(project_root, "backend", "person_c", "data", "raw", "osie", "osie_source", "data", "stimuli")
    base_data = os.path.join(project_root, "backend", "person_c", "data", "processed", "osie")
    out_os = os.path.join(base_data, "gt_original", "saliency")
    out_gs = os.path.join(base_data, "gt_saliency")
    
    visualize_saliency("1001.jpg", stim_dir, out_os, out_gs)
