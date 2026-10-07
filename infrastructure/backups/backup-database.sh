#!/usr/bin/env bash
# ==============================================================================
# KHPosCommerce - Production Database Backup & Retention Script
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

DB_CONNECTION="${DB_CONNECTION:-pgsql}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:-khposcommerce}"
DB_USERNAME="${DB_USERNAME:-postgres}"

BACKUP_FILE="${BACKUP_DIR}/${DB_DATABASE}_backup_${TIMESTAMP}.sql.gz"

echo "📦 [$(date +'%Y-%m-%d %H:%M:%S')] Starting backup for database: ${DB_DATABASE}..."

if [ "$DB_CONNECTION" = "pgsql" ]; then
    PGPASSWORD="${DB_PASSWORD:-}" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" "$DB_DATABASE" | gzip > "$BACKUP_FILE"
elif [ "$DB_CONNECTION" = "mysql" ]; then
    MYSQL_PWD="${DB_PASSWORD:-}" mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" "$DB_DATABASE" | gzip > "$BACKUP_FILE"
fi

echo "✅ Backup successfully created at: ${BACKUP_FILE}"

# Cleanup backups older than retention period
echo "🧹 Removing backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -name "*_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "🎉 Backup task finished successfully."
