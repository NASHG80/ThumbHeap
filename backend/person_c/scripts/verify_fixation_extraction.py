import os
import glob
import numpy as np

def verify_fixation_extraction(npz_dir):
    files = glob.glob(os.path.join(npz_dir, '*.npz'))
    print(f"Found {len(files)} .npz files.")
    
    # Check just a few files
    for f in files[:3]:
        data = np.load(f)
        x = data['x']
        y = data['y']
        dur = data['duration']
        obs = data['observer_id']
        
        img_name = os.path.basename(f).replace('.npz', '.jpg')
        
        print(f"\nImage: {img_name}")
        print(f"Observers: {len(np.unique(obs))}")
        print(f"Total fixations: {len(x)}")
        print(f"x shape: {x.shape}")
        print(f"y shape: {y.shape}")
        print(f"duration shape: {dur.shape}")
        
        assert len(x) == len(y) == len(dur) == len(obs), "Length mismatch!"
        assert not np.isnan(x).any() and not np.isinf(x).any(), "NaN/Inf in x"
        assert not np.isnan(y).any() and not np.isinf(y).any(), "NaN/Inf in y"
        
        # Valid bounds 800x600 (actually x is up to 800, y up to 600, or might be 1-indexed so bounds approx [0, 800] and [0, 600])
        assert np.all((x >= -50) & (x <= 850)), f"x out of bounds: {np.min(x)} to {np.max(x)}"
        assert np.all((y >= -50) & (y <= 650)), f"y out of bounds: {np.min(y)} to {np.max(y)}"

if __name__ == '__main__':
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "processed", "osie", "raw_fixations")
    verify_fixation_extraction(out_dir)
