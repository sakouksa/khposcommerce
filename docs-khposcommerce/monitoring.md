# 📊 ការតាមដានសុខភាព និងត្រួតពិនិត្យប្រព័ន្ធ (Monitoring & Observability)

ឯកសារនេះបង្ហាញអំពីរបៀបត្រួតពិនិត្យដំណើរការ Server, Database, Queue Workers, Error Logs, និង API Health Endpoints។

---

## 1. ប្រព័ន្ធ Health Check Endpoint (`/api/health`)

Backend បានបំពាក់នូវ Health Check Controller ដែលផ្តល់ព័ត៌មានស្ថានភាពប្រព័ន្ធតាមទម្រង់ JSON៖

### Endpoint Request:
`GET https://api.example.com/api/health` ឬ `GET https://api.example.com/api/v1/health`

### គំរូ Response (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2026-08-24T08:45:00+07:00",
  "response_time_ms": 4.12,
  "checks": {
    "database": {
      "status": "UP",
      "driver": "pgsql",
      "latency_ms": 1.45
    },
    "cache": {
      "status": "UP",
      "driver": "redis",
      "latency_ms": 0.85
    },
    "storage": {
      "status": "UP",
      "disk": "local",
      "latency_ms": 1.10
    },
    "system": {
      "php_version": "8.3.16",
      "environment": "production",
      "debug_mode": false,
      "memory_usage": "18.42 MB"
    }
  }
}
```

Endpoint នេះអាចយកទៅភ្ជាប់ជាមួយ Uptime Monitors ដូចជា **UptimeRobot**, **Better Uptime**, ឬ **Cloudflare Health Checks** ដើម្បីផ្ញើសារ Alert តាម Telegram/Email ពេលប្រព័ន្ធមានបញ្ហា។

---

## 2. ការពិនិត្យមើល Logs ក្នុងពេលជាក់ស្តែង (Real-time Log Inspection)

```bash
# មើល Logs ទាំងអស់របស់ Production Stack
docker compose -f docker-compose.prod.yml logs -f

# មើលតែ Laravel API Error Logs
docker exec -it enterprise_pos_backend_prod tail -f /var/www/storage/logs/laravel.log

# មើល Queue Worker Activity Logs
docker exec -it enterprise_pos_backend_prod tail -f /var/log/laravel-queue.log

# មើល Nginx Access & Error Logs
docker exec -it enterprise_pos_gateway_prod tail -f /var/log/nginx/error.log
```

---

## 3. ម៉ែត្រិកសំខាន់ៗដែលត្រូវតាមដាន (Key Performance Metrics)

1. **HTTP Error Rate**: តាមដានចំនួន 500 Internal Server Errors និង 429 Too Many Requests (Rate limit spikes)។
2. **Database Query Latency**: កំណត់ PostgreSQL `log_min_duration_statement = 200` ក្នុង `postgresql.conf` ដើម្បីចាប់ Slow Queries ដែលដំណើរការលើសពី 200ms។
3. **Queue Backlog**: ត្រួតពិនិត្យចំនួន Jobs ដែលកកស្ទះក្នុង Redis តាមរយៈ `php artisan queue:monitor redis:default`។
4. **Server Resources**: តាមដាន CPU Utilization (< 75%), RAM Usage (< 85%), និង Disk Space (< 80%) តាមរយៈ `docker stats` ឬ `htop`។
