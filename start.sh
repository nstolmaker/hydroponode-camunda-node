#!/bin/sh

pm2 start "node -- main.js" --cron-restart="0/10 * * * *"
