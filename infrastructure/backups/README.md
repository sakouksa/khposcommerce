# 💾 Automated Database Backups

This script creates daily compressed `.sql.gz` backups for either PostgreSQL or MySQL and automatically purges old archives older than 14 days.

## Automated Cron Job Setup

To run daily at 2:00 AM:

```bash
0 2 * * * cd /path/to/khposcommerce && ./infrastructure/backups/backup-database.sh >> /var/log/khpos_backup.log 2>&1
```
