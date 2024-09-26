#!/bin/bash

# init.sh
# Script to build and run the Docker container for the PDF CMYK Converter

# Exit immediately if a command exits with a non-zero status
set -e

# Define variables
IMAGE_NAME="imagepro-file-process"
CONTAINER_NAME="imagepro-file-process-container"
HOST_PORT=3000
CONTAINER_PORT=3000

# Function to check if a container is running
is_container_running() {
  docker ps --filter "name=^/${CONTAINER_NAME}$" --filter "status=running" | grep "${CONTAINER_NAME}" > /dev/null 2>&1
}

# Function to check if a container exists
does_container_exist() {
  docker ps -a --filter "name=^/${CONTAINER_NAME}$" | grep "${CONTAINER_NAME}" > /dev/null 2>&1
}

echo "🛠️  Starting initialization script..."

# If container is running, stop it
if is_container_running; then
  echo "🚧 Stopping existing running container '${CONTAINER_NAME}'..."
  docker stop "${CONTAINER_NAME}"
fi

# If container exists (but not running), remove it
if does_container_exist; then
  echo "🗑️  Removing existing container '${CONTAINER_NAME}'..."
  docker rm "${CONTAINER_NAME}"
fi

# Build the Docker image
echo "📦 Building Docker image '${IMAGE_NAME}'..."
docker build -t "${IMAGE_NAME}" .

# Run the Docker container
echo "🚀 Running Docker container '${CONTAINER_NAME}'..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  "${IMAGE_NAME}"

# Wait for a few seconds to allow the container to initialize
echo "⏳ Waiting for the container to initialize..."
sleep 5

# Check if the container is running
if is_container_running; then
  echo "✅ Docker container '${CONTAINER_NAME}' is up and running."
  echo "🌐 Access the application at http://localhost:${HOST_PORT}"
else
  echo "❌ Failed to start the Docker container '${CONTAINER_NAME}'. Check the logs for more details."
  exit 1
fi
