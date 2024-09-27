#!/bin/bash

# Directory where PDF files are stored
UPLOADS_DIR="/app/uploads"

# Find and delete PDF files older than 60 minutes
find "$UPLOADS_DIR" -type f -name "*.pdf" -mmin +60 -exec rm -v {} \;

# Log the cleanup time
echo "Cleanup completed at $(date)" >> /app/logs/cleanup.log
