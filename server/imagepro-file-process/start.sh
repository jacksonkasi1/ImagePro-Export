#!/bin/sh
# Start cron in the background and log output
cron && echo "Cron service started"

# Start the Node.js server
node dist/index.js --host 0.0.0.0 --port 7860
