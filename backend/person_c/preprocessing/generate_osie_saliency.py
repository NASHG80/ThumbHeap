import os
import glob
import numpy as np
import scipy.ndimage as ndimage
import cv2

def get_matlab_gaussian(size, sigma):
    """Matches MATLAB's fspecial('gaussian', [size size], sigma)"""
    r, c = np.mgrid[0:size, 0:size]
    r = r - (size - 1.0) / 2.0
    c = c - (size - 1.0) / 2.0
    h = np.exp(-(c**2 + r**2) / (2 * sigma**2))
    h[h < np.finfo(h.dtype).eps * h.max()] = 0
    sum_h = h.sum()
    if sum_h != 0:
        h /= sum_h
    return h

def generate_maps(raw_fixations_dir, out_orig_fix, out_orig_sal, out_gt_fix, out_gt_sal):
    npz_files = glob.glob(os.path.join(raw_fixations_dir, '*.npz'))
    
    sigma = 24
    win_size = 168
    gaussian_kernel = get_matlab_gaussian(win_size, sigma)
    
    orig_w, orig_h = 800, 600
    model_w, model_h = 384, 288
    
    processed = 0
    failed = 0
    total_fixations = 0
    
    for fpath in npz_files:
        filename = os.path.basename(fpath)
        base_name = os.path.splitext(filename)[0]
        
        try:
            data = np.load(fpath)
            x = data['x']
            y = data['y']
            
            # --- 1. Original Resolution (600x800) ---
            # MATLAB coordinate transformation:
            # fix_x = max(1, min(round(sub.fix_x), w))
            # fix_x = floor(fix_x)
            x_rnd = np.round(x)
            x_rnd = np.clip(x_rnd, 1, orig_w)
            x_floor = np.floor(x_rnd)
            
            y_rnd = np.round(y)
            y_rnd = np.clip(y_rnd, 1, orig_h)
            y_floor = np.floor(y_rnd)
            
            # Convert 1-based MATLAB indices to 0-based Python indices
            x_idx = (x_floor - 1).astype(np.int32)
            y_idx = (y_floor - 1).astype(np.int32)
            
            # MATLAB: map(fix_y(k), fix_x(k)) = 1; 
            # Note: Overlapping fixations do NOT accumulate in original MATLAB code. 
            # They just set the pixel to 1.
            fix_map_orig = np.zeros((orig_h, orig_w), dtype=np.float32)
            fix_map_orig[y_idx, x_idx] = 1.0
            
            total_fixations += len(x)
            
            # Use cv2.filter2D which is heavily optimized compared to ndimage.correlate
            # cv2.filter2D handles boundaries differently (reflect by default), 
            # so we pad with zeros first to match MATLAB's zero boundary.
            pad_r = win_size // 2
            fix_map_padded = cv2.copyMakeBorder(fix_map_orig, pad_r, pad_r, pad_r, pad_r, cv2.BORDER_CONSTANT, value=0.0)
            sal_map_orig = cv2.filter2D(fix_map_padded, -1, gaussian_kernel)
            
            # Crop back to original size
            sal_map_orig = sal_map_orig[pad_r:-pad_r, pad_r:-pad_r]
            
            # MATLAB: map = normalise(map);
            if sal_map_orig.max() > 0:
                sal_map_orig = (sal_map_orig - sal_map_orig.min()) / (sal_map_orig.max() - sal_map_orig.min())
                
            np.save(os.path.join(out_orig_fix, f"{base_name}.npy"), fix_map_orig)
            np.save(os.path.join(out_orig_sal, f"{base_name}.npy"), sal_map_orig)
            
            # --- 2. Model Resolution (288x384) ---
            # Saliency Map: Resize the original smoothed saliency map
            sal_map_model = cv2.resize(sal_map_orig, (model_w, model_h), interpolation=cv2.INTER_LINEAR)
            if sal_map_model.max() > 0:
                sal_map_model = (sal_map_model - sal_map_model.min()) / (sal_map_model.max() - sal_map_model.min())
            
            np.save(os.path.join(out_gt_sal, f"{base_name}.npy"), sal_map_model)
            
            # Fixation Map: 
            # The data contract requires [0, 1] range. 
            # We scale the coordinates and set the pixels to 1.0. 
            # This preserves the binary spatial presence meaning of the original OSIE code.
            x_model = np.clip(np.round(x * (model_w / orig_w)), 1, model_w)
            y_model = np.clip(np.round(y * (model_h / orig_h)), 1, model_h)
            x_m_idx = (np.floor(x_model) - 1).astype(np.int32)
            y_m_idx = (np.floor(y_model) - 1).astype(np.int32)
            
            fix_map_model = np.zeros((model_h, model_w), dtype=np.float32)
            fix_map_model[y_m_idx, x_m_idx] = 1.0
            
            np.save(os.path.join(out_gt_fix, f"{base_name}.npy"), fix_map_model)
            
            processed += 1
        except Exception as e:
            print(f"Failed on {filename}: {e}")
            failed += 1
            
    print(f"\nProcessed: {processed}, Failed: {failed}, Total Fixations Used: {total_fixations}")
    print(f"NOTE on Fixation Map Normalization: Model-resolution fixation maps are generated as RAW COUNTS (not min-max normalized) to preserve exact point density for evaluation metrics.")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    
    base_data = os.path.join(project_root, "backend", "person_c", "data", "processed", "osie")
    raw_fix = os.path.join(base_data, "raw_fixations")
    out_of = os.path.join(base_data, "gt_original", "fixation")
    out_os = os.path.join(base_data, "gt_original", "saliency")
    out_gf = os.path.join(base_data, "gt_fixation")
    out_gs = os.path.join(base_data, "gt_saliency")
    
    generate_maps(raw_fix, out_of, out_os, out_gf, out_gs)
