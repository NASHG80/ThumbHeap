import torch
import torch.nn as nn

class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)

class FusionNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        
        # Encoder
        self.enc1_1 = ConvBlock(8, 16)
        self.enc1_2 = ConvBlock(16, 32)
        self.pool1 = nn.MaxPool2d(2)
        
        self.enc2 = ConvBlock(32, 64)
        self.pool2 = nn.MaxPool2d(2)
        
        self.enc3 = ConvBlock(64, 128)
        
        # Decoder
        # Upsample 128 -> 64
        self.up1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        # After concat: 64 (up) + 64 (enc2) = 128
        self.dec1 = ConvBlock(128, 64)
        
        # Upsample 64 -> 32
        self.up2 = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
        # After concat: 32 (up) + 32 (enc1_2) = 64
        self.dec2 = ConvBlock(64, 32)
        
        # Channel reduction to 16 before final output
        self.dec3 = ConvBlock(32, 16)
        
        # Output layer for residual (no activation here so it can be negative or positive)
        self.final_conv = nn.Conv2d(16, 1, kernel_size=1)

    def forward(self, x):
        # Channel 0 is the TranSalNet base heatmap
        base_heatmap = x[:, 0:1, :, :]
        
        # Encoder
        x1 = self.enc1_1(x)
        x1 = self.enc1_2(x1)  # skip 1
        
        p1 = self.pool1(x1)
        x2 = self.enc2(p1)    # skip 2
        
        p2 = self.pool2(x2)
        x3 = self.enc3(p2)    # bottleneck
        
        # Decoder
        d1 = self.up1(x3)
        # concat skip 2
        d1 = torch.cat([x2, d1], dim=1)
        d1 = self.dec1(d1)
        
        d2 = self.up2(d1)
        # concat skip 1
        d2 = torch.cat([x1, d2], dim=1)
        d2 = self.dec2(d2)
        
        # Final layers
        d3 = self.dec3(d2)
        residual = self.final_conv(d3)
        
        # Add residual to base heatmap
        final_map = base_heatmap + residual
        
        # Clamp to ensure it stays in [0, 1] range as required
        final_map = torch.clamp(final_map, 0.0, 1.0)
        
        return final_map
