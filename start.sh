#!/bin/sh

pm2 start "node -- main.js" --name main  --cron-restart="0 */6 * * *"
pm2 start "node -- timeoutWorker.js" --name timeoutWorker --cron-restart="0 * * * *"
#pm2 start "node -- main.js" --cron-restart="0/10 * * * *"
