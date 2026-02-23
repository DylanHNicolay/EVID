#!/bin/bash
# Setup script to initialize Husky git hooks
# Run this script once after cloning the repository

set -e

echo "Setting up Husky git hooks..."

# Navigate to the git root (parent directory)
cd "$(dirname "$0")/.."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
  echo "Error: Not in a git repository root"
  exit 1
fi

# Install Husky hooks
cd divecloud-react
if [ -f "node_modules/.bin/husky" ]; then
  echo "Initializing Husky..."
  npx husky install .husky
  echo "✅ Husky hooks initialized successfully!"
  echo ""
  echo "Git hooks are now active. The linter will run on commit."
else
  echo "⚠️  Husky not found. Please run 'npm install' first."
  exit 1
fi
