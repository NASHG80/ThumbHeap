import os
import scipy.io as sio
import numpy as np

mat_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "raw", "osie", "osie_source", "data", "eye", "fixations.mat")
print(f"Loading {mat_path}...")
mat = sio.loadmat(mat_path)

print("\n--- NON-MAT METADATA KEYS ---")
keys = [k for k in mat.keys() if not k.startswith('__')]
for k in keys:
    val = mat[k]
    print(f"Key: {k}, Type: {type(val)}, Shape: {getattr(val, 'shape', None)}, Dtype: {getattr(val, 'dtype', None)}")

def describe(obj, indent=0, max_depth=5):
    prefix = "  " * indent
    if indent > max_depth:
        print(f"{prefix}...")
        return
    
    if isinstance(obj, np.ndarray):
        print(f"{prefix}ndarray, shape={obj.shape}, dtype={obj.dtype}")
        if obj.dtype.names is not None:
            for name in obj.dtype.names:
                print(f"{prefix}- Field: '{name}'")
                describe(obj[name], indent + 1, max_depth)
        elif obj.dtype == object and obj.size > 0:
            print(f"{prefix}- Object 0:")
            # object array might be 2D
            first = obj.flat[0]
            describe(first, indent + 1, max_depth)
            if obj.size > 1:
                print(f"{prefix}- (and {obj.size - 1} more items)")
        elif obj.dtype.kind in ['U', 'S'] and obj.size > 0:
            print(f"{prefix}- String: {obj.flat[0]}")
        elif obj.size > 0:
            print(f"{prefix}- Value[0]: {obj.flat[0]}")
    else:
        print(f"{prefix}{type(obj)}: {obj}")

print("\n--- FIXATIONS VARIABLE ---")
describe(mat['fixations'], max_depth=6)

