#!/usr/bin/env bash
set -e

echo "🚀 Deploying KHPosCommerce to STAGING..."
docker compose -f docker-compose.staging.yml pull
docker compose -f docker-compose.staging.yml up -d --build --remove-orphans
docker compose -f docker-compose.staging.yml exec -T backend php artisan migrate --force
docker compose -f docker-compose.staging.yml exec -T backend php artisan config:cache
docker compose -f docker-compose.staging.yml exec -T backend php artisan route:cache
echo "✅ Staging deployment finished successfully!"
