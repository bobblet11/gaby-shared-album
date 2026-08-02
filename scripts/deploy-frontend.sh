#!/bin/bash
# deploy-frontend.sh
set -euo pipefail

# ---------------------------------------------------------------------------- #
echo "Loading env..."
set -a
source ./frontend/.env
set +a

echo "----------------------------------------------"
echo "Updating NGINX..."

echo "Copying ${REPO_NAME} to sites-available..."
SOURCE_CONFIG=$(ls "${PROJECT_PATH}/infra/nginx/*" | head -n 1)
sudo cp "${SOURCE_CONFIG}" "/etc/nginx/sites-available/${REPO_NAME}"

echo "Linking .../sites-available/${REPO_NAME} to sites-enabled..."
sudo ln -sf "/etc/nginx/sites-available/${REPO_NAME}" "/etc/nginx/sites-enabled/${REPO_NAME}"

echo "Testing configuration..."
sudo nginx -t

echo "Restarting NGINX..."
sudo systemctl reload nginx

# # ---------------------------------------------------------------------------- #
# echo "Installing dependencies..."
# cd ./frontend
# npm ci --production

# # ---------------------------------------------------------------------------- #
# echo "Building react app..."
# npm run build

# # ---------------------------------------------------------------------------- #
# echo "Copying React build to /var/www..."
# sudo mkdir -p "/var/www/${REPO_NAME}/build"
# sudo cp -r build/* "/var/www/${REPO_NAME}/build/"
