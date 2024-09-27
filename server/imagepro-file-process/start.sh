#!/bin/sh
# Start cron service in the background
cron &

# Start the Node.js server
node dist/index.js --host 0.0.0.0 --port 7860
