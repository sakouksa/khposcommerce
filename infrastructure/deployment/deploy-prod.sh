#!/usr/bin/env bash
set -e

echo "🚀 Deploying KHPosCommerce to PRODUCTION..."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
docker compose -f docker-compose.prod.yml exec -T backend php artisan migrate --force
docker compose -f docker-compose.prod.yml exec -T backend php artisan config:cache
docker compose -f docker-compose.prod.yml exec -T backend php artisan route:cache
docker compose -f docker-compose.prod.yml exec -T backend php artisan view:cache
echo "✅ Production deployment finished successfully!"
