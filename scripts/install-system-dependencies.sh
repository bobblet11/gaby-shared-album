#!/bin/bash
# install-system-dependencies.sh
set -euo pipefail

echo "----------------------------------------------"
echo "Updating package lists..."
sudo apt update -y

echo "----------------------------------------------"
echo "Installing core build tools..."
sudo apt install -y build-essential curl gnupg2 ca-certificates lsb-release software-properties-common

echo "----------------------------------------------"
echo "Installing PostgreSQL..."
if ! command -v psql >/dev/null 2>&1; then
  sudo apt install -y postgresql postgresql-contrib
else
  echo "PostgreSQL already installed: $(psql --version)"
fi

echo "----------------------------------------------"
echo "Installing Git..."
if ! command -v git >/dev/null 2>&1; then
  sudo apt install -y git
else
  echo "Git already installed: $(git --version)"
fi

echo "----------------------------------------------"
echo "Installing UFW (firewall)..."
if ! command -v ufw >/dev/null 2>&1; then
  sudo apt install -y ufw
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
  sudo ufw --force enable
else
  echo "UFW already installed: $(ufw --version)"
fi

echo "----------------------------------------------"
echo "Installing Certbot (for HTTPS)..."
if ! command -v certbot >/dev/null 2>&1; then
  sudo apt install -y certbot python3-certbot-nginx
else
  echo "Certbot already installed: $(certbot --version)"
fi

echo "----------------------------------------------"
echo "Installing NGINX..."
if ! command -v nginx >/dev/null 2>&1; then
  sudo apt install -y nginx
else
  echo "NGINX already installed: $(nginx -v 2>&1)"
fi

echo "----------------------------------------------"
echo "Installing Node.js + npm..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "Node.js already installed: $(node -v)"
fi

echo "----------------------------------------------"
echo "Updating npm..."
if command -v npm >/dev/null 2>&1; then
  sudo npm install -g npm@latest
else
  echo "npm not found, installing with Node.js..."
fi

echo "----------------------------------------------"
echo "Installing PM2 (process manager)..."
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
else
  echo "PM2 already installed: $(pm2 -v)"
fi

echo "----------------------------------------------"
echo "System dependencies installed successfully!"
