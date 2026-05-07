#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-mission-control}"
APP_PORT="${PORT:-3000}"

echo "[prod-start] building app"
npm run build

echo "[prod-start] starting pm2 process ${APP_NAME} on port ${APP_PORT}"
PORT="${APP_PORT}" pm2 start .output/server/index.mjs --name "${APP_NAME}" --update-env
pm2 save

echo "[prod-start] done. check logs with: pm2 logs ${APP_NAME}"
