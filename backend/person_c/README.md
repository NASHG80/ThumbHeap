# Person C - Data + OpenCV + Evaluation

This folder belongs to **Person C**.

## Virtual Environment
- `.venv-c` is created exclusively for Person C's work and dependencies.
- It is ignored by Git to avoid conflicts with Person A and Person B.

## Requirements
- `requirements-c.txt` contains ONLY the packages needed for Person C's work (e.g., NumPy, OpenCV, pandas).
- It deliberately excludes large ML models and frontend dependencies.

## Data Storage
- Raw OSIE dataset goes under `data/raw/osie`.
- Processed OSIE data goes under `data/processed/osie`.

## Spatial Maps Standard
All spatial maps must eventually use:
- width = 384
- height = 288
- NumPy shape = `(288, 384)`
- dtype = `float32`
- range = `[0, 1]`
- format = `.npy`

## Scalar Features
Scalar features will be stored separately as CSV.

## Rules
- Person C must not modify Person A/B model environments.

## Handoff for Person B (Detection Pipeline)
1. **Local Dataset**: The raw OSIE dataset is not tracked in Git. It must exist locally in `backend/person_c/data/raw/osie/`.
2. **Activating Environment**: To process maps in Person C's logic, activate `.venv-c` via `.\.venv-c\Scripts\Activate.ps1`.
3. **Image Directory**: Person B should point their detectors (PaddleOCR, YuNet, YOLO-World) to `backend/person_c/data/processed/osie/images/`.
4. **Required Image Resolution**: The images in the processed directory are `384x288`. Detectors must operate on this resolution (or properly scale their coordinates back to it).
5. **Required Outputs**: Person B must output maps in `backend/person_c/data/processed/osie/` under `text_map/`, `face_map/`, and `object_map/`.
6. **Map Contract**: Each generated map must be of shape `(288, 384)`, `float32`, range `[0.0, 1.0]`, saved as `.npy`.
7. **Image IDs**: The `.npy` filenames must perfectly match the original OSIE image IDs (e.g. `1001.npy`).
8. **Git Rules**: Person B MUST NOT commit the dataset, generated `.npy` files, or images into the repository.
9. **Environment Segregation**: Person B MUST NOT use Person C's `.venv-c` environment.
10. **Person B Dependencies**: Person B MUST use their own dependency environment/requirements file for their deep learning detection stack.
