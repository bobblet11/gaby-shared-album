#!/bin/bash
# deploy-backend.sh
set -euo pipefail

# run from inside project

# ---------------------------------------------------------------------------- #
echo "Loading env..."
set -a
source ./backend/.env
set +a

# ---------------------------------------------------------------------------- #
echo "Updating Postgres..."

echo "Checking Postgres..."
sudo systemctl is-active --quiet postgresql || sudo systemctl restart postgresql

echo "Testing Postgres connection..."
node ./scripts/test-postgres-connection.js

echo "Checking database migration status..."
npm run migrate:status

echo "Running database migration..."
npm run migrate:up

# ---------------------------------------------------------------------------- #

echo "Installing backend dependencies..."
cd backend
npm ci --production
cd ..

echo "Restarting backend service with PM2..."
BACKEND_APP_NAME="${REPO_NAME}.backend"
if pm2 describe "$BACKEND_APP_NAME" >/dev/null; then
  pm2 restart "$BACKEND_APP_NAME" --update-env
else
  pm2 start ./backend/app.js --name "$BACKEND_APP_NAME"
fi


