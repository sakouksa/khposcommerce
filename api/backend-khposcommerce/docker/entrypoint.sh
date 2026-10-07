#!/bin/sh
set -e

# Fix storage permissions if needed
mkdir -p /var/www/storage/framework/sessions \
         /var/www/storage/framework/views \
         /var/www/storage/framework/cache \
         /var/www/storage/logs \
         /var/www/bootstrap/cache

chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Generate storage link if missing
if [ ! -L /var/www/public/storage ]; then
    php /var/www/artisan storage:link || true
fi

# Run optimization if in production
if [ "$APP_ENV" = "production" ] && [ -n "$APP_KEY" ]; then
    echo "Caching Laravel configuration for production..."
    php /var/www/artisan config:cache || true
    php /var/www/artisan route:cache || true
    php /var/www/artisan view:cache || true
    php /var/www/artisan event:cache || true
fi

exec "$@"
