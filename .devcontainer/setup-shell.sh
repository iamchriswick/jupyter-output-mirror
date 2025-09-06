#!/bin/bash

# Shell setup script for devcontainer
# Installs and configures lla, starship, and custom zsh configuration

set -e

echo "🚀 Setting up enhanced shell environment..."

# Install starship prompt
echo "📦 Installing Starship..."
curl -sS https://starship.rs/install.sh | sh -s -- --yes

# Install lla (modern ls replacement)
echo "📦 Installing lla..."
# Try to install from releases
LLA_VERSION="v0.2.8"
ARCH=$(uname -m)
case $ARCH in
  x86_64) LLA_ARCH="x86_64-unknown-linux-musl" ;;
  aarch64) LLA_ARCH="aarch64-unknown-linux-musl" ;;
  *) echo "⚠️  Unsupported architecture: $ARCH. Skipping lla installation."; exit 0 ;;
esac

LLA_URL="https://github.com/triyanox/lla/releases/download/${LLA_VERSION}/lla-${LLA_ARCH}.tar.gz"
curl -sL "$LLA_URL" | tar -xz -C /tmp
sudo mv /tmp/lla /usr/local/bin/lla
sudo chmod +x /usr/local/bin/lla

# Create starship config directory
mkdir -p ~/.config

# Copy custom configurations
cp /workspaces/jupyter-output-mirror/.devcontainer/starship.toml ~/.config/starship.toml
cp /workspaces/jupyter-output-mirror/.devcontainer/zshrc ~/.zshrc

# Source the new zsh configuration
source ~/.zshrc

echo "✅ Shell environment setup complete!"
echo "🎨 Starship prompt configured"
echo "📂 lla aliases available: ls, ll, llt, llr, llg, lls"
echo "🔄 Run 'reload' to refresh your shell"
