#!/bin/sh
set -e

PORT="${PORT:-10000}"

# Default CACHE_STORE and SESSION_DRIVER to file if not explicitly redis
export CACHE_STORE="${CACHE_STORE:-file}"
export SESSION_DRIVER="${SESSION_DRIVER:-file}"

echo "==> Starting Enterprise POS Laravel Backend on port $PORT..."

# Storage link & database migrations
php artisan storage:link || true
php artisan migrate --force --no-interaction || true

# Caching for production performance
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "==> Server ready at 0.0.0.0:$PORT"
exec php artisan serve --host=0.0.0.0 --port="$PORT"
