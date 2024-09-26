#!/bin/bash

# remove.sh
# Script to stop and remove the Docker container and image for the PDF CMYK Converter

# Exit immediately if a command exits with a non-zero status
set -e

# Define variables
IMAGE_NAME="imagepro-file-process"
CONTAINER_NAME="imagepro-file-process-container"

# Function to check if a container is running
is_container_running() {
  docker ps --filter "name=^/${CONTAINER_NAME}$" --filter "status=running" | grep "${CONTAINER_NAME}" > /dev/null 2>&1
}

# Function to check if a container exists
does_container_exist() {
  docker ps -a --filter "name=^/${CONTAINER_NAME}$" | grep "${CONTAINER_NAME}" > /dev/null 2>&1
}

echo "🧹 Starting cleanup script..."

# If container is running, stop it
if is_container_running; then
  echo "🚧 Stopping running container '${CONTAINER_NAME}'..."
  docker stop "${CONTAINER_NAME}"
fi

# If container exists, remove it
if does_container_exist; then
  echo "🗑️  Removing container '${CONTAINER_NAME}'..."
  docker rm "${CONTAINER_NAME}"
fi

# Optionally, remove the Docker image
read -p "🗑️  Do you want to remove the Docker image '${IMAGE_NAME}'? (y/N): " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
  echo "🗑️  Removing Docker image '${IMAGE_NAME}'..."
  docker rmi "${IMAGE_NAME}"
else
  echo "🛑 Skipping removal of Docker image '${IMAGE_NAME}'."
fi

echo "✅ Cleanup completed successfully."
