import torch
import sys
import os

# Ensure the script can import FusionNetwork from the same directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from model import FusionNetwork

def main():
    print("--- Testing FusionNetwork on GPU ---")
    
    cuda_available = torch.cuda.is_available()
    print(f"CUDA availability: {cuda_available}")
    
    if not cuda_available:
        print("CUDA is not available. Exiting.")
        return
        
    gpu_name = torch.cuda.get_device_name(0)
    print(f"GPU name: {gpu_name}")
    
    device = torch.device("cuda")
    
    # Initialize and move model
    model = FusionNetwork()
    model = model.to(device)
    model.eval()
    
    # Create dummy input on GPU
    dummy_input = torch.randn(2, 8, 288, 384, device=device)
    
    # Forward pass
    with torch.no_grad():
        output = model(dummy_input)
        
    print(f"Input device: {dummy_input.device}")
    print(f"Output device: {output.device}")
    print(f"Input shape: {dummy_input.shape}")
    print(f"Output shape: {output.shape}")
    
    # Verify shape
    expected_shape = torch.Size([2, 1, 288, 384])
    assert output.shape == expected_shape, f"Shape mismatch: {output.shape} != {expected_shape}"
    
    # Memory
    mem_alloc = torch.cuda.memory_allocated(0) / (1024 ** 2)
    mem_res = torch.cuda.memory_reserved(0) / (1024 ** 2)
    print(f"GPU memory allocated: {mem_alloc:.2f} MB")
    print(f"GPU memory reserved: {mem_res:.2f} MB")
    
    # NaN / Inf
    nan_count = torch.isnan(output).sum().item()
    inf_count = torch.isinf(output).sum().item()
    print(f"NaN count: {nan_count}")
    print(f"Inf count: {inf_count}")
    
    assert nan_count == 0, "Output contains NaN"
    assert inf_count == 0, "Output contains Inf"

    print("\nAll GPU validations passed!")

if __name__ == "__main__":
    main()
