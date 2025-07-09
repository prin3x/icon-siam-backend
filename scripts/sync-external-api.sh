#!/bin/bash

# Sync External API Cron Job Script
# This script runs the sync-external-api command daily at 1 AM

# Set the working directory to the project root
cd "$(dirname "$0")/.."

# Load environment variables if .env file exists
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set Node options to prevent deprecation warnings
export NODE_OPTIONS="--no-deprecation"

# Log file for cron output
LOG_DIR="logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/cron-sync-$(date +%Y%m%d).log"

# Timestamp for logging
echo "=== Sync External API Cron Job Started at $(date) ===" >> "$LOG_FILE"

# Run the sync command
echo "Running sync-external-api command..." >> "$LOG_FILE"
pnpm run sync-external-api >> "$LOG_FILE" 2>&1

# Check exit status
if [ $? -eq 0 ]; then
    echo "=== Sync completed successfully at $(date) ===" >> "$LOG_FILE"
else
    echo "=== Sync failed at $(date) ===" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE" 