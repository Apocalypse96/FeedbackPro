#!/bin/bash

# Build script for feedback-backend Docker image

echo "Building feedback-backend Docker image..."

# Get version from git tag or use 'latest'
VERSION=${1:-latest}

# Build the image
docker build -t feedback-backend:${VERSION} .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "Image: feedback-backend:${VERSION}"
    echo ""
    echo "To run the image:"
    echo "docker run -p 5000:5000 feedback-backend:${VERSION}"
    echo ""
    echo "To run with environment variables:"
    echo "docker run -p 5000:5000 --env-file .env feedback-backend:${VERSION}"
else
    echo "❌ Docker build failed!"
    exit 1
fi 