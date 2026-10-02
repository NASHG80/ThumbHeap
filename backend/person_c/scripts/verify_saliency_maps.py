import os
import glob
import numpy as np

def verify_maps(orig_fix_dir, orig_sal_dir, gt_fix_dir, gt_sal_dir):
    orig_fix = glob.glob(os.path.join(orig_fix_dir, '*.npy'))
    orig_sal = glob.glob(os.path.join(orig_sal_dir, '*.npy'))
    gt_fix = glob.glob(os.path.join(gt_fix_dir, '*.npy'))
    gt_sal = glob.glob(os.path.join(gt_sal_dir, '*.npy'))
    
    print(f"Original Fixation maps: {len(orig_fix)}")
    print(f"Original Saliency maps: {len(orig_sal)}")
    print(f"GT Fixation maps: {len(gt_fix)}")
    print(f"GT Saliency maps: {len(gt_sal)}")
    
    assert len(orig_fix) == 700, "Missing original fixation maps"
    assert len(orig_sal) == 700, "Missing original saliency maps"
    assert len(gt_fix) == 700, "Missing gt fixation maps"
    assert len(gt_sal) == 700, "Missing gt saliency maps"
    
    # Check a few
    for f in orig_sal[:3]:
        base_name = os.path.basename(f)
        
        # Load all 4
        of = np.load(os.path.join(orig_fix_dir, base_name))
        os_map = np.load(os.path.join(orig_sal_dir, base_name))
        gf = np.load(os.path.join(gt_fix_dir, base_name))
        gs = np.load(os.path.join(gt_sal_dir, base_name))
        
        print(f"\n--- Checking {base_name} ---")
        print(f"Original Fixation: shape={of.shape}, dtype={of.dtype}, range=[{of.min()}, {of.max()}]")
        print(f"Original Saliency: shape={os_map.shape}, dtype={os_map.dtype}, range=[{os_map.min():.4f}, {os_map.max():.4f}]")
        print(f"GT Fixation (counts): shape={gf.shape}, dtype={gf.dtype}, range=[{gf.min()}, {gf.max()}]")
        print(f"GT Saliency: shape={gs.shape}, dtype={gs.dtype}, range=[{gs.min():.4f}, {gs.max():.4f}]")
        
        assert of.shape == (600, 800), "Original fix shape mismatch"
        assert os_map.shape == (600, 800), "Original sal shape mismatch"
        assert gf.shape == (288, 384), "GT fix shape mismatch"
        assert gs.shape == (288, 384), "GT sal shape mismatch"
        
        assert not np.isnan(of).any() and not np.isinf(of).any(), "NaN/Inf in original fixation"
        assert not np.isnan(os_map).any() and not np.isinf(os_map).any(), "NaN/Inf in original saliency"
        assert not np.isnan(gf).any() and not np.isinf(gf).any(), "NaN/Inf in GT fixation"
        assert not np.isnan(gs).any() and not np.isinf(gs).any(), "NaN/Inf in GT saliency"
        
        assert gf.min() >= 0.0 and gf.max() <= 1.0, f"GT fixation not in [0, 1], got [{gf.min()}, {gf.max()}]"
        assert gs.min() >= 0.0 and gs.max() <= 1.0, "GT saliency not in [0, 1]"

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    
    base_data = os.path.join(project_root, "backend", "person_c", "data", "processed", "osie")
    out_of = os.path.join(base_data, "gt_original", "fixation")
    out_os = os.path.join(base_data, "gt_original", "saliency")
    out_gf = os.path.join(base_data, "gt_fixation")
    out_gs = os.path.join(base_data, "gt_saliency")
    
    verify_maps(out_of, out_os, out_gf, out_gs)
