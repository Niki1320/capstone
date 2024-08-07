import torch
import torch.nn as nn

class ConvAutoencoder(nn.Module):
    def __init__(self, input_channels=1):
        super(ConvAutoencoder, self).__init__()
        self.encoder = nn.Sequential(
            nn.Conv1d(in_channels=input_channels, out_channels=32, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.Conv1d(in_channels=32, out_channels=64, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.Conv1d(in_channels=64, out_channels=128, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.Conv1d(in_channels=128, out_channels=256, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.Conv1d(in_channels=256, out_channels=512, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.Conv1d(in_channels=512, out_channels=1024, kernel_size=5, stride=2, padding=2),
            nn.ReLU()
        )
        self.pool = nn.AdaptiveAvgPool1d(1)
        
        self.decoder = nn.Sequential(
            nn.ConvTranspose1d(in_channels=1024, out_channels=512, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.ConvTranspose1d(in_channels=512, out_channels=256, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.ConvTranspose1d(in_channels=256, out_channels=128, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.ConvTranspose1d(in_channels=128, out_channels=64, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.ConvTranspose1d(in_channels=64, out_channels=32, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.ConvTranspose1d(in_channels=32, out_channels=input_channels, kernel_size=5, stride=2, padding=2)
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.pool(x)
        x = x.view(x.size(0), -1)  # Flatten
        x = x.unsqueeze(2)  # Add channel dimension
        x = self.decoder(x)
        return x

    def get_signature(self, x):
        with torch.no_grad():
            x = self.encoder(x)
            x = self.pool(x)
            return x.view(x.size(0), -1)  # Flatten to get the 1024-sized signature
