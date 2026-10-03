import os
import time
import torch
import torch.optim as optim
import pandas as pd
import numpy as np

import config
from model import FusionNetwork
from dataloader import get_dataloaders

# Set deterministic seed
torch.manual_seed(config.SEED)
np.random.seed(config.SEED)

def kl_divergence(pred, target):
    # Normalize to probability distributions
    pred = pred / (torch.sum(pred, dim=(2,3), keepdim=True) + 1e-7)
    target = target / (torch.sum(target, dim=(2,3), keepdim=True) + 1e-7)
    
    pred = torch.clamp(pred, min=1e-7)
    target = torch.clamp(target, min=1e-7)
    
    return torch.sum(target * torch.log(target / pred), dim=(2,3)).mean()

def cc_loss(pred, target):
    pred_mean = torch.mean(pred, dim=(2,3), keepdim=True)
    target_mean = torch.mean(target, dim=(2,3), keepdim=True)
    
    pred_zero = pred - pred_mean
    target_zero = target - target_mean
    
    cov = torch.sum(pred_zero * target_zero, dim=(2,3))
    std_pred = torch.sqrt(torch.sum(pred_zero**2, dim=(2,3)) + 1e-7)
    std_target = torch.sqrt(torch.sum(target_zero**2, dim=(2,3)) + 1e-7)
    
    cc = cov / (std_pred * std_target)
    return (1.0 - cc).mean()

def compute_loss(pred, target):
    kl = kl_divergence(pred, target)
    cc = cc_loss(pred, target)
    return kl + 0.5 * cc

def main():
    print("--- Starting FusionNetwork Training ---")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    train_loader, val_loader, _ = get_dataloaders(config.DATA_BASE_DIR, batch_size=config.BATCH_SIZE)
    
    model = FusionNetwork().to(device)
    optimizer = optim.AdamW(model.parameters(), lr=config.LEARNING_RATE, weight_decay=config.WEIGHT_DECAY)
    
    best_val_loss = float('inf')
    patience_counter = 0
    best_epoch = 0
    history = []
    
    start_time = time.time()
    
    for epoch in range(1, config.EPOCHS + 1):
        print(f"\nEpoch {epoch}/{config.EPOCHS}")
        
        # Train
        model.train()
        train_losses = []
        for batch in train_loader:
            X = batch['X'].to(device)
            Y = batch['Y'].to(device)
            
            optimizer.zero_grad()
            pred = model(X)
            
            loss = compute_loss(pred, Y)
            loss.backward()
            optimizer.step()
            
            train_losses.append(loss.item())
            
        avg_train_loss = np.mean(train_losses)
        print(f"Train loss: {avg_train_loss:.4f}")
        
        # Validate
        model.eval()
        val_losses = []
        with torch.no_grad():
            for batch in val_loader:
                X = batch['X'].to(device)
                Y = batch['Y'].to(device)
                
                pred = model(X)
                loss = compute_loss(pred, Y)
                val_losses.append(loss.item())
                
        avg_val_loss = np.mean(val_losses)
        print(f"Val loss: {avg_val_loss:.4f}")
        
        history.append({
            'epoch': epoch,
            'train_loss': avg_train_loss,
            'val_loss': avg_val_loss
        })
        
        # Checkpointing and Early Stopping
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            best_epoch = epoch
            patience_counter = 0
            
            checkpoint = {
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'train_loss': avg_train_loss,
                'val_loss': avg_val_loss,
                'config': {
                    'lr': config.LEARNING_RATE,
                    'batch_size': config.BATCH_SIZE
                }
            }
            torch.save(checkpoint, os.path.join(config.CHECKPOINT_DIR, "best_fusion.pth"))
            print("best checkpoint status: UPDATED")
        else:
            patience_counter += 1
            print(f"best checkpoint status: NO IMPROVEMENT ({patience_counter}/{config.PATIENCE})")
            
        if patience_counter >= config.PATIENCE:
            print("Early stopping triggered!")
            break
            
    total_time = time.time() - start_time
    
    # Save History
    df_history = pd.DataFrame(history)
    df_history.to_csv(os.path.join(config.CHECKPOINT_DIR, "training_history.csv"), index=False)
    
    print("\n--- Training Complete ---")
    print(f"Best epoch: {best_epoch}")
    print(f"Best validation loss: {best_val_loss:.4f}")
    print(f"Total training time: {total_time:.2f} seconds")
    print(f"Checkpoint path: {os.path.join(config.CHECKPOINT_DIR, 'best_fusion.pth')}")

if __name__ == "__main__":
    main()
