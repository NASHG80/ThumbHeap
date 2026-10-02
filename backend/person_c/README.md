# Person C Handoff - Data, Vision Features & Pipeline Integration

## 1. PERSON C ROLE
Person C is responsible for establishing the canonical dataset, extracting core visual features, and assembling the ground truth. Specifically, Person C owns:
- OSIE dataset preparation and download validation.
- Fixation extraction from the original raw annotations.
- Ground-truth saliency generation (spatial heatmaps) from extracted fixations.
- Authoritative Train/Validation/Test splitting.
- OpenCV visual feature extraction (brightness, contrast, saturation, edge).
- Scalar feature calculation.
- Feature alignment and validation.
- Integration and validation of Person B's outputs against the canonical data contract.
- Final handoff of all aligned feature maps and the manifest to Person A.

Person C **does NOT own**:
- TranSalNet implementation or base heatmap generation.
- The Fusion model implementation or training.
- Person B's deep learning detector implementations (PaddleOCR, YuNet, YOLO-World).

## 2. CURRENT PROJECT ARCHITECTURE
The overall pipeline is defined exactly as follows:

```
YouTube Thumbnail
    ├── TranSalNet → base heatmap
    ├── PaddleOCR → text regions/map
    ├── YuNet → face regions/map
    ├── YOLO-World-S → object/subject regions/map
    └── OpenCV → brightness/contrast/saturation/edge features
             ↓
       Fusion Network (trained by team)
             ↓
       Final Attention Heatmap
```
- **TranSalNet** provides the primary/base saliency prediction.
- **Person B detectors** provide semantic contextual spatial maps.
- **Person C OpenCV features** provide measurable low-level visual information.
- **The Fusion network** is responsible for learning how to combine these signals effectively. Text, faces, and objects represent auxiliary spatial context, **NOT manually assigned attention weights**. We do not hardcode heuristics like "face = 40%".

## 3. PERSON C DIRECTORY STRUCTURE
The verified active repository layout for Person C is as follows:

```
backend/person_c/
    data/
        raw/osie/            # (Local only) Original OSIE images and .mat files
        processed/osie/      # (Local only) Processed 384x288 images, generated .npy maps, splits, and manifest
    evaluation/              # Source code for future evaluation metrics
    opencv_features/         # Source code for generating brightness/contrast/etc
    outputs/                 # (Local only) Evaluation plots, test visualizations
    preprocessing/           # Source code for dataset preparation, fixations, GT saliency
    scripts/                 # Orchestration and validation regression scripts
    requirements-c.txt       # Person C dependency file
    README.md                # This handoff document
    DATA_CONTRACT.md         # The formal alignment rules
```
Note: Folders marked "Local only" are ignored by Git. Only source code, requirements, and documentation are committed.

## 4. DEPENDENCIES / ENVIRONMENT
Person C's pipeline requires a lightweight, dedicated Python environment that avoids massive ML dependencies.
- **Requirements File**: `backend/person_c/requirements-c.txt`
- **Separation**: Person C's environment is cleanly separated from Person A's TranSalNet (PyTorch 1.7) environment and Person B's detection stack (Paddle/Ultralytics). Person C relies purely on standard data-science utilities (NumPy, SciPy, Pandas, OpenCV, Pillow, Matplotlib).
- **Environment Rules**: Do not install Person A or Person B ML dependencies into this environment. Virtual environments (`.venv-c`) are `.gitignore`d.

**Setup Instructions:**
```powershell
python -m venv backend/person_c/.venv-c
.\backend\person_c\.venv-c\Scripts\Activate.ps1
pip install -r backend/person_c/requirements-c.txt
pip check
```

## 5. OSIE DATASET
The canonical dataset is the **OSIE (Object and Semantic Images and Eye-tracking) dataset**.
- **Scale**: 700 images, exactly 15 observers per image.
- **Coordinates**: The raw spatial coordinates in `fixations.mat` correspond to the original 800×600 OSIE coordinate system.
- **IDs**: The numerical image ID located in the MATLAB `fixations.mat` structure serves as the authoritative ID for all operations (e.g., `1001`).
- **Data State**: Raw image files and the original MATLAB annotation files (`fixations.mat`, `attrs.mat`) reside in `backend/person_c/data/raw/osie/osie_source`. The initial extraction step generates `raw_fixations` as `.npz` arrays inside `backend/person_c/data/processed/osie/raw_fixations/`.
- **Git Policy**: No raw images, `.mat` files, `.npz` binaries, or `.npy` maps are tracked by Git.

## 6. FIXATION EXTRACTION
**Script**: `backend/person_c/preprocessing/osie_fixation_parser.py`
The script processes `fixations.mat` iteratively to dump individual observer coordinates (x, y) and durations.
- **Coordinate System**: Preserves the original 800×600 coordinates.
- **Observer Details**: Exactly 15 observers are maintained.
- **Original Behavior Audited**: We explicitly audited the original MATLAB implementation. The original script creates a *binary fixation map* where presence is 1. Overlapping fixations from different observers do not additively accumulate, and fixation duration is recorded but fundamentally ignored by the original saliency generation logic. Our extraction aligns perfectly with this.

## 7. GROUND-TRUTH SALIENCY GENERATION
**Script**: `backend/person_c/preprocessing/generate_osie_saliency.py`
- Generates both the discrete `gt_fixation` (binary presence) and the continuous `gt_saliency` (Gaussian smoothed) maps.
- **Smoothing Logic**: A 2D Gaussian filter is applied to the fixation presence map. It perfectly mirrors the MATLAB logic using a `sigma` equivalent to roughly 24 pixels in the original resolution scale, utilizing 'constant' (0) padding.
- **Standardized Data Contract**: Output arrays are transformed from 800×600 into the locked pipeline architecture dimension.
  - Image dimensions: `384 × 288`
  - NumPy shape: `(288, 384)`
  - Dtype: `float32`
  - Range: `[0.0, 1.0]` (Normalized)
- **Training Target**: The `gt_saliency` map is designated as the continuous spatial target for Fusion Network training.

## 8. TRAIN / VALIDATION / TEST SPLIT
**Script**: `backend/person_c/scripts/create_osie_split.py`
The split is highly deterministic (Random Seed: 42) and distributed as follows:
- **Train**: 490 images (70%)
- **Validation**: 105 images (15%)
- **Test**: 105 images (15%)

**Verification**: No overlap exists. Split definitions reside in `backend/person_c/data/processed/osie/` as `train.csv`, `val.csv`, and `test.csv`. The validation script `verify_split_regression.py` asserts these strictly align with the feature manifest.

## 9. OPENCV FEATURE EXTRACTION
**Script**: `backend/person_c/opencv_features/feature_extractor.py` (orchestrated by `run_opencv_features.py`)
Person C natively generates four 2D spatial feature maps, stored strictly within the canonical 384×288 float32 contract:
1. **Brightness**: HSV V channel, min-max normalized to `[0, 1]`.
2. **Contrast**: Local grayscale standard deviation calculated using an 11×11 neighborhood, normalized to `[0, 1]`.
3. **Saturation**: HSV S channel, normalized to `[0, 1]`.
4. **Edge**: Sobel gradient magnitude followed by a 5×5 box smoothing operation, normalized to `[0, 1]`.

## 10. SCALAR FEATURES
Alongside the spatial feature maps, scalar features are extracted into a CSV file (`scalar_features.csv`).
- Contains: `mean_brightness`, `mean_contrast`, `mean_saturation`, and `edge_density`.
- These are discrete numerical columns and are completely separated from the spatial feature maps. They are not to be arbitrarily converted into spatial maps unless the architecture is officially updated to broadcast them.

## 11. PERSON B INTEGRATION
Person B's detection pipeline (PaddleOCR, YuNet, YOLO-World-S) is fully integrated.
- Person B owns the detector implementations.
- Person C owns the canonical OSIE dataset.
- Person B outputs `text_map`, `face_map`, and `object_map` directly into `backend/person_c/data/processed/osie/`.
- Person C rigorously validates Person B's outputs against the data contract. We successfully verified all 700 arrays to be perfectly aligned in shape `(288, 384)`, dtype `float32`, and range `[0.0, 1.0]`. The arrays match the OSIE numerical IDs flawlessly.

## 12. FEATURE ALIGNMENT / DATA CONTRACT
This is the most critical constraint in the project. Every single spatial map provided for the Fusion network strictly adheres to:
- **Shape**: `(288, 384)`
- **Data Type**: `float32`
- **Value Range**: `[0.0, 1.0]`
- **Alignment**: Filenames and array structures align identically across all modalities based on the canonical image ID (e.g. `1001.npy`).

**Fusion Channels (8 Inputs)**
1. `base_heatmap` **(Pending: Person A)**
2. `text_map` (Person B)
3. `face_map` (Person B)
4. `object_map` (Person B)
5. `brightness_map` (Person C)
6. `contrast_map` (Person C)
7. `saturation_map` (Person C)
8. `edge_map` (Person C)

**Fusion Target (1 Output)**
- `gt_saliency` (Person C)

The Fusion model expects an input tensor shape of `(batch, 8, 288, 384)`.

## 13. FEATURE MANIFEST
**Path**: `backend/person_c/data/processed/osie/feature_manifest.csv`
- A single canonical CSV that links an `image_id` (e.g., `1001`) to the relative paths of every single generated NumPy feature map for that image.
- It contains exactly 700 rows, ensuring data completeness.
- **IMPORTANT**: The `base_heatmap_path` column is included by design but is intentionally left blank. It awaits Person A's generated TranSalNet outputs.

## 14. VALIDATION / REGRESSION SCRIPTS
All validation scripts reside in `backend/person_c/scripts/`. Run them using the `.venv-c` environment to mathematically verify the pipeline.
- `verify_fixation_extraction.py`: Asserts exactly 700 raw `.npz` fixation files exist and arrays match lengths correctly.
- `verify_saliency_maps.py`: Validates `gt_fixation` and `gt_saliency` adhere to the 384x288 `float32` `[0,1]` contract.
- `verify_osie_split.py`: Asserts mathematically zero overlap between train, validation, and test subsets.
- `verify_opencv_features.py`: Asserts OpenCV visual spatial maps follow the data contract.
- `verify_feature_alignment.py`: Scans all folders, generates `feature_manifest.csv`, and enforces that there are exactly 700 matching arrays for every feature type across the entire dataset without missing files or malformed dimensions (including Person B's outputs).
- `verify_split_regression.py`: Enforces that all IDs inside `train.csv`, `val.csv`, and `test.csv` successfully exist within the generated `feature_manifest.csv` with zero overlap.

## 15. CURRENT VERIFIED STATUS

| Task | Status | Owner |
|------|--------|-------|
| OSIE Download & Extraction | ✅ Complete | Person C |
| Fixation Extraction | ✅ Complete | Person C |
| Ground-Truth Maps | ✅ Complete | Person C |
| Train/Val/Test Splitting | ✅ Complete | Person C |
| OpenCV Feature Maps | ✅ Complete | Person C |
| Scalar Features | ✅ Complete | Person C |
| Person B Integration | ✅ Complete | Person B/C |
| Feature Alignment/Validation | ✅ Complete | Person C |
| Git Hygiene & Regression | ✅ Complete | Person C |

*Pending: Person A Base Heatmap Integration, Fusion Architecture, Fusion Training.*

## 16. FILES PERSON A NEEDS
**Person A — What You Need**
Do NOT spend time rebuilding Person C's dataset preparation or Person B's detectors. Your pipeline entry point is ready.
1. Pull the latest `main`.
2. Read this README in full to understand the rigorous 384×288 float32 contract.
3. Establish TranSalNet and generate `base_heatmap` arrays for the 700 OSIE images.
4. Scale your output to `(288, 384)` float32 `[0.0, 1.0]`.
5. Save your arrays to a structured folder and run the feature manifest update to populate the `base_heatmap_path` column.
6. Assemble your PyTorch DataLoader to construct the `(batch, 8, 288, 384)` input tensor based strictly on the feature manifest rows.
7. Use the mapped `gt_saliency_path` as your training target.
8. Train the Fusion Network and evaluate the results.

## 17. PERSON A EXPECTED NEXT STEPS
As agreed, Person A will proceed precisely as follows:
1. **A1**: Setup TranSalNet PyTorch 1.7 environment.
2. **A2**: Download pre-trained Dense & Res backbone weights.
3. **A3**: Perform test inference.
4. **A4**: Run baseline inference on 20–50 real YouTube thumbnails.
5. **A5**: Benchmark visual quality of Dense vs Res backbones. **(Do not blindly hardcode a choice without actual visual benchmarking evidence).**
6. **A6**: Select the optimal backbone.
7. **A7**: Run batch inference against the canonical 700 OSIE images.
8. **A8**: Produce compliant `base_heatmap` arrays.
9. **A9-A13**: Design Fusion architecture, configure pipeline, train, checkpoint, and finalize integration.

## 18. EVALUATION
Evaluation scripts (in `evaluation/`) will assess both the TranSalNet baseline and the final Fusion system.
Planned standard metrics:
- **NSS** (Normalized Scanpath Saliency)
- **CC** (Pearson's Correlation Coefficient)
- **SIM** (Similarity)
- **KL** (Kullback-Leibler Divergence)
- **AUC** (Area Under Curve)
Note: We will perform ablation studies to measure the exact performance delta contributed by the semantic and OpenCV feature sets. Final metrics do not exist yet.

## 19. REPRODUCTION / QUICK START
**For a New Developer:**
- **Environment**: Create a standard Python venv (`.venv-c`) and install `backend/person_c/requirements-c.txt`. (Do NOT use ML packages here).
- **Dataset Location**: The dataset is intentionally ignored by Git. Download OSIE and place `osie_source` in `backend/person_c/data/raw/osie/`.
- **Generate Fixations & GT**: Run `python backend/person_c/preprocessing/osie_fixation_parser.py` followed by `generate_osie_saliency.py`.
- **Generate Split**: Run `python backend/person_c/scripts/create_osie_split.py`.
- **Generate OpenCV Features**: Run `python backend/person_c/scripts/run_opencv_features.py`.
- **Validate Everything**: Execute `python backend/person_c/scripts/verify_feature_alignment.py` and `python backend/person_c/scripts/verify_split_regression.py`.
- **Consumed by A**: Person A strictly consumes `feature_manifest.csv` and the generated `.npy` files inside `backend/person_c/data/processed/osie/`.

## 20. GIT / GENERATED DATA POLICY
To preserve repository health, we strictly enforce `.gitignore` for massive files:
- `backend/person_c/.venv-c/` and `backend/.venv-person-b/` are completely ignored.
- `backend/person_c/data/raw/osie/` is ignored.
- `backend/person_c/data/processed/osie/` (including images, splits, and all `.npy` features) is ignored.
- `backend/person_c/outputs/` is ignored.
Only configuration files, dependencies, documentation, and Python source code are tracked. A fresh clone requires regenerating the arrays locally via the provided scripts.

## 21. HANDOFF SUMMARY
Person C has fully completed their assigned workflow up to the production of validated, perfectly aligned auxiliary feature inputs. Person B's detection pipeline is successfully integrated and verified against the canonical contract.

Person A, the baton is officially passed to you. Your sole remaining responsibilities are generating the TranSalNet base heatmaps, constructing the Fusion Network, training the integrated system, and concluding with robust YouTube-domain evaluation.
