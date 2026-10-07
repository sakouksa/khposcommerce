#!/usr/bin/env bash
set -e

echo "=== KHPosCommerce Monorepo Setup ==="

# 1. Root dependencies
echo "📦 Installing workspace dependencies..."
npm install

# 2. Backend API setup
echo "🐘 Configuring Laravel API backend..."
if [ -d "api/backend-khposcommerce" ]; then
  cd api/backend-khposcommerce
  if [ ! -f .env ]; then
    cp .env.example .env
  fi
  composer install
  php artisan key:generate
  cd ../..
fi

# 3. Webclient setup
echo "⚛️ Setting up Admin & Storefront web clients..."
if [ -d "webclient/admin-khposcommerce" ]; then
  cd webclient/admin-khposcommerce && npm install && cd ../..
fi

if [ -d "webclient/storefront-khposcommerce" ]; then
  cd webclient/storefront-khposcommerce && npm install && cd ../..
fi

echo "✅ KHPosCommerce setup completed successfully!"
