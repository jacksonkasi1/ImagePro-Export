#!/bin/bash

# Path to the log file
LOG_FILE="/app/logs/cleanup.log"

# Truncate the log file (reset it)
: > "$LOG_FILE"

# Log the reset time
echo "Log file reset at $(date)" >> "$LOG_FILE"
