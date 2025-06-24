#!/bin/bash

# Run script for feedback-backend Docker container

echo "Starting feedback-backend Docker container..."

# Default values
PORT=${PORT:-5000}
VERSION=${1:-latest}
CONTAINER_NAME="feedback-backend-$(date +%s)"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "Using .env file for environment variables"
    ENV_FLAG="--env-file .env"
else
    echo "No .env file found, using default environment"
    ENV_FLAG=""
fi

# Run the container
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:5000 \
    ${ENV_FLAG} \
    feedback-backend:${VERSION}

if [ $? -eq 0 ]; then
    echo "✅ Container started successfully!"
    echo "Container name: ${CONTAINER_NAME}"
    echo "Access the API at: http://localhost:${PORT}"
    echo ""
    echo "To view logs: docker logs ${CONTAINER_NAME}"
    echo "To stop container: docker stop ${CONTAINER_NAME}"
    echo "To remove container: docker rm ${CONTAINER_NAME}"
    echo ""
    echo "Testing API..."
    sleep 3
    curl -s http://localhost:${PORT}/ | jq . || echo "API is starting up..."
else
    echo "❌ Failed to start container!"
    exit 1
fi 