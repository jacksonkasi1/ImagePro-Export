#!/bin/bash

# Directory where PDF files are stored
UPLOADS_DIR="/app/uploads"

# Log file to record deletions
LOG_FILE="/app/logs/cleanup.log"

# Ensure the log directory exists
mkdir -p /app/logs

# Find and delete PDF files older than 60 minutes
find "$UPLOADS_DIR" -type f -name "*.pdf" -mmin +60 -exec rm -v {} \; >> "$LOG_FILE" 2>&1

# Log the cleanup time
echo "Cleanup completed at $(date)" >> "$LOG_FILE"
