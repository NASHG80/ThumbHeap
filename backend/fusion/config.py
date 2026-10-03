import os

# Root directories
FUSION_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(FUSION_DIR)
DATA_BASE_DIR = os.path.join(BACKEND_DIR, "person_c", "data", "processed", "osie")

# Checkpoints and Results
CHECKPOINT_DIR = os.path.join(FUSION_DIR, "checkpoints")
RESULTS_DIR = os.path.join(FUSION_DIR, "results")

# Hyperparameters
BATCH_SIZE = 16
LEARNING_RATE = 1e-4
EPOCHS = 50
WEIGHT_DECAY = 1e-4
PATIENCE = 7
SEED = 42

# Ensure directories exist
os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)
