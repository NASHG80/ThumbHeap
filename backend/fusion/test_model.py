import torch
from model import FusionNetwork

def main():
    print("--- Testing FusionNetwork ---")
    model = FusionNetwork()
    
    # Create dummy input (B, C, H, W)
    dummy_input = torch.randn(2, 8, 288, 384)
    print(f"Input shape: {dummy_input.shape}")
    
    # Forward pass
    output = model(dummy_input)
    print(f"Output shape: {output.shape}")
    
    # Verify shape
    assert output.shape == torch.Size([2, 1, 288, 384]), f"Shape mismatch: {output.shape}"
    
    # Verify no NaN/Inf
    nan_count = torch.isnan(output).sum().item()
    inf_count = torch.isinf(output).sum().item()
    print(f"NaN count: {nan_count}")
    print(f"Inf count: {inf_count}")
    
    assert nan_count == 0, "Output contains NaN"
    assert inf_count == 0, "Output contains Inf"
    
    # Parameter count
    param_count = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Parameter count: {param_count:,}")
    
    print("\nAll model validations passed!")

if __name__ == "__main__":
    main()
