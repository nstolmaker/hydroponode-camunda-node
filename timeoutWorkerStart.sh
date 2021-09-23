#!/bin/sh

pm2 start "node -- timeoutWorker.js" --cron "2,7,12,17,22,27,32,37,42,47,52,58 * * * *" --restart-delay 300000
