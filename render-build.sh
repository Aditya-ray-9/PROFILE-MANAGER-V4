#!/bin/bash
# Build script for Render deployment

# Install dependencies
npm install

# Build client-side assets
npm run build

# Make the script executable
chmod +x render-build.sh
