#!/bin/sh

pm2 start "node -- main.js" --name main 
pm2 start "node -- timeoutWorker.js" --name timeoutWorker
#pm2 start "node -- main.js" --cron-restart="0/10 * * * *"
