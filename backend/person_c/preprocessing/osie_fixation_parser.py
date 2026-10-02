import os
import sys
import numpy as np
import scipy.io as sio

def load_osie_fixations(mat_path):
    print(f"Loading {mat_path}...")
    mat = sio.loadmat(mat_path)
    return mat['fixations']

def extract_image_id(entry):
    img_field = entry['img']
    if isinstance(img_field, np.ndarray) and img_field.size > 0:
        if isinstance(img_field[0], np.ndarray) and img_field[0].size > 0:
            return str(img_field[0, 0][0])
        return str(img_field[0])
    return str(img_field)

def extract_subject_fixations(subject_obj, observer_id):
    if not isinstance(subject_obj, np.ndarray) or subject_obj.size == 0:
        return None
    
    subj_data = subject_obj[0, 0]
    fix_x = subj_data['fix_x'][0, 0].flatten() if 'fix_x' in subj_data.dtype.names else np.array([])
    fix_y = subj_data['fix_y'][0, 0].flatten() if 'fix_y' in subj_data.dtype.names else np.array([])
    fix_dur = subj_data['fix_duration'][0, 0].flatten() if 'fix_duration' in subj_data.dtype.names else np.array([])
    
    n_fix = len(fix_x)
    obs_id = np.full((n_fix,), observer_id, dtype=np.int32)
    
    return {
        'x': fix_x,
        'y': fix_y,
        'duration': fix_dur,
        'observer_id': obs_id
    }

def extract_all_fixations(mat_path, stimuli_dir, output_dir):
    fixations = load_osie_fixations(mat_path)
    num_entries = fixations.shape[0]
    
    processed_count = 0
    missing_data_count = 0
    mismatch_count = 0
    
    total_fixations = 0
    all_x = []
    all_y = []
    all_dur = []
    obs_counts = []
    
    for i in range(num_entries):
        entry = fixations[i, 0]
        img_id = extract_image_id(entry)
        
        stimulus_path = os.path.join(stimuli_dir, img_id)
        if not os.path.exists(stimulus_path):
            print(f"Error: Stimulus {img_id} not found at {stimulus_path}")
            mismatch_count += 1
            sys.exit(1)
            
        subjects = entry['subjects']
        if not isinstance(subjects, np.ndarray) or subjects.size == 0:
            missing_data_count += 1
            continue
            
        subject_list = subjects[0, 0]
        num_subjects = subject_list.shape[0]
        obs_counts.append(num_subjects)
        
        if num_subjects != 15:
            print(f"Warning: {img_id} has {num_subjects} observers, expected 15.")
            
        img_x = []
        img_y = []
        img_dur = []
        img_obs = []
        
        for j in range(num_subjects):
            subj_data = extract_subject_fixations(subject_list[j:j+1, :], j)
            if subj_data:
                img_x.append(subj_data['x'])
                img_y.append(subj_data['y'])
                img_dur.append(subj_data['duration'])
                img_obs.append(subj_data['observer_id'])
                
        if img_x:
            img_x = np.concatenate(img_x)
            img_y = np.concatenate(img_y)
            img_dur = np.concatenate(img_dur)
            img_obs = np.concatenate(img_obs)
            
            total_fixations += len(img_x)
            all_x.append(img_x)
            all_y.append(img_y)
            all_dur.append(img_dur)
            
            base_name = os.path.splitext(img_id)[0]
            out_path = os.path.join(output_dir, f"{base_name}.npz")
            np.savez(out_path, x=img_x, y=img_y, duration=img_dur, observer_id=img_obs)
            processed_count += 1
            
    print(f"\n--- EXTRACTION SUMMARY ---")
    print(f"Images processed: {processed_count}")
    print(f"Images with missing data: {missing_data_count}")
    print(f"Images with mismatch/not found: {mismatch_count}")
    
    if obs_counts:
        print(f"Observers per image: Min {min(obs_counts)}, Max {max(obs_counts)}")
    print(f"Total fixations: {total_fixations}")
    
    if all_x:
        all_x = np.concatenate(all_x)
        all_y = np.concatenate(all_y)
        all_dur = np.concatenate(all_dur)
        print(f"X range: [{np.min(all_x):.1f}, {np.max(all_x):.1f}]")
        print(f"Y range: [{np.min(all_y):.1f}, {np.max(all_y):.1f}]")
        print(f"Duration range: [{np.min(all_dur)}, {np.max(all_dur)}]")

if __name__ == '__main__':
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "raw", "osie")
    mat_file = os.path.join(base_dir, "osie_source", "data", "eye", "fixations.mat")
    stim_dir = os.path.join(base_dir, "osie_source", "data", "stimuli")
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "processed", "osie", "raw_fixations")
    
    extract_all_fixations(mat_file, stim_dir, out_dir)
