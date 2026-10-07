#!/usr/bin/env bash
set -e

echo "🚀 Running Database Migrations for KHPosCommerce..."
cd "$(dirname "$0")/../../api/backend-khposcommerce"
php artisan migrate --force
echo "✅ Migrations completed successfully!"
