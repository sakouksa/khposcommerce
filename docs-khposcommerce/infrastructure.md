# 🏗️ ហេដ្ឋារចនាសម្ព័ន្ធ និងបណ្តាញប្រព័ន្ធ (Infrastructure & Network Topology)

ឯកសារនេះបង្ហាញអំពីរចនាសម្ព័ន្ធលម្អិតនៃ Containers, Data Storage Volumes, Process Supervision, និង Reverse Proxy Routing។

---

## 1. ដ្យាក្រាមរចនាសម្ព័ន្ធ Containers (Container Topology Diagram)

```mermaid
graph TD
    subgraph HostSystem[" Linux Host (Ubuntu 24.04 LTS) "]
        subgraph PublicEdge[" Public Ports "]
            P80[Port 80 HTTP]
            P443[Port 443 HTTPS]
        end

        subgraph GatewayContainer[" Nginx Gateway Container "]
            Nginx[Nginx Reverse Proxy + SSL Termination]
        end

        subgraph FrontendContainers[" Static Web Containers "]
            WebNginx["Customer Website Container (dist/)"]
            AdminNginx["Admin Dashboard Container (dist/)"]
        end

        subgraph BackendCluster[" Backend Application Cluster "]
            PHPFPM["PHP 8.3-FPM (Port 9000)"]
            Supervisor["Supervisord Process Manager"]
            QueueWorker1["Redis Queue Worker #1"]
            QueueWorker2["Redis Queue Worker #2"]
            Scheduler["Laravel Task Scheduler (Cron 60s)"]
            
            Supervisor --> PHPFPM
            Supervisor --> QueueWorker1
            Supervisor --> QueueWorker2
            Supervisor --> Scheduler
        end

        subgraph PersistentData[" Data Persistence Layer "]
            PGSQL[("PostgreSQL 16 Engine")]
            REDIS[("Redis 7 Engine")]
            VOL_STORAGE[("Named Volume: backend_storage")]
            VOL_DB[("Named Volume: postgres_data")]
            VOL_REDIS[("Named Volume: redis_data")]
        end

        P80 --> Nginx
        P443 --> Nginx

        Nginx -->|Host: www.example.com| WebNginx
        Nginx -->|Host: admin.example.com| AdminNginx
        Nginx -->|Host: api.example.com| PHPFPM
        Nginx -->|/storage/*| VOL_STORAGE

        PHPFPM --> PGSQL
        PHPFPM --> REDIS
        PHPFPM --> VOL_STORAGE

        QueueWorker1 --> REDIS
        QueueWorker1 --> PGSQL
        QueueWorker2 --> REDIS
        QueueWorker2 --> PGSQL
        Scheduler --> PHPFPM

        PGSQL --- VOL_DB
        REDIS --- VOL_REDIS
    end
```

---

## 2. ការបែងចែក Persistent Volumes

ដើម្បីធានាថារូបភាពទំនិញ និងទិន្នន័យ Database មិនបាត់បង់ពេល Restart Containers:
1. `postgres_data`: រក្សាទុកទិន្នន័យ Tables, Indexes, Sequences, និង Relations ទាំងអស់របស់ PostgreSQL 16 នៅក្នុង `/var/lib/postgresql/data`។
2. `redis_data`: រក្សាទុក AOF (Append-Only File) Snapshots របស់ Redis នៅក្នុង `/data`។
3. `backend_storage`: រក្សាទុកឯកសារដែល Upload មក (Product images, Avatars, Category icons, Invoices, Exported Excel reports) នៅក្នុង `/var/www/storage`។

---

## 3. ដំណើរការ Supervisor Process Manager

នៅក្នុង `backend` container មានដំណើរការ `supervisord` ដែលគ្រប់គ្រង Background Services ស្វ័យប្រវត្ត៖
- **`php-fpm`**: ទទួលសំណើ API ពី Nginx Gateway។
- **`laravel-queue`**: ដំណើរការ 2 Workers ស្របគ្នា (`queue:work redis --sleep=3 --tries=3 --max-time=3600`) ដើម្បីផ្ញើ Email, Push Notifications, និងបង្កើតរបាយការណ៍។
- **`laravel-scheduler`**: ដំណើរការ Cron Jobs រៀងរាល់ 1 នាទីម្តង (`php artisan schedule:run`) សម្រាប់ពិនិត្យ Flash Sale, លុប Expired Carts, និង Auto-cleanup។
