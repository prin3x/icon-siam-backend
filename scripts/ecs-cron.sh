#!/bin/bash

# Simple ECS Cron Setup
# This script sets up a cron job directly on your ECS server

echo "=== Simple ECS Cron Setup ==="
echo ""

# Get the project directory
PROJECT_DIR="/app"
SCRIPT_PATH="$PROJECT_DIR/scripts/sync-external-api.sh"

echo "Setting up cron job to run sync-external-api daily at 1 AM..."
echo ""

# Make sure the script is executable
chmod +x "$SCRIPT_PATH"

# Create a simple cron entry
CRON_ENTRY="0 1 * * * $SCRIPT_PATH"

echo "Adding cron job: $CRON_ENTRY"
echo ""

# Add to crontab
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Cron job added successfully!"
    echo ""
    echo "Current cron jobs:"
    crontab -l
    echo ""
    echo "The sync-external-api command will now run daily at 1 AM"
    echo ""
    echo "To test manually, run:"
    echo "  $SCRIPT_PATH"
    echo ""
    echo "To remove this cron job later, run:"
    echo "  crontab -e"
    echo "  Then delete the line: $CRON_ENTRY"
else
    echo "❌ Failed to add cron job"
    exit 1
fi 