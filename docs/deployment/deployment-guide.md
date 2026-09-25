# 🚀 ការដាក់ដំណើរការប្រព័ន្ធលើ Production (Production Deployment Guide)

ឯកសារនេះរៀបរាប់អំពីដំណើរការលម្អិតក្នុងការដាក់ឱ្យដំណើរការ (Deploy) ប្រព័ន្ធ **Project-Enterprise-E-Commerce-POS-System** នៅលើ Production Server ដោយប្រើប្រាស់ Docker Containers, PostgreSQL 16, Redis 7, Nginx Gateway, និង Zero-Downtime Deployment Scripts។

---

## 1. ស្ថាបត្យកម្មរួមនៃប្រព័ន្ធ (Overall System Architecture)

ប្រព័ន្ធនេះត្រូវបានរៀបចំឡើងជា 4 Sub-projects ដាច់ដោយឡែកពីគ្នា (Decoupled Architecture):
- **Admin Dashboard**: គឺជា Static Frontend SPA (React 19 + Vite) ដំណើរការលើ `admin.example.com`។ វាមិនត្រូវការ PHP Server ទេ គឺគ្រាន់តែ Serve `dist/` តាមរយៈ Nginx Alpine ហើយផ្ញើ API Requests ទៅកាន់ Laravel Backend តាមរយៈ `https://api.example.com/api/v1`។
- **Customer Website**: គឺជា E-Commerce Storefront SPA (React 19 + Vite) ដំណើរការលើ `www.example.com`។
- **Laravel Backend API**: ដំណើរការលើ `api.example.com` ជាមួយ PHP 8.3-FPM, PostgreSQL 16, និង Redis 7។
- **Flutter Mobile App**: ដំណើរការលើ Android & iOS ដោយប្រើប្រាស់ API Base URL `https://api.example.com/api/v1`។

```
INTERNET
   │
   ├──▶ https://www.example.com     ──▶ Customer Website (Nginx SPA)
   ├──▶ https://admin.example.com   ──▶ Admin Dashboard (Nginx SPA)
   ├──▶ https://api.example.com     ──▶ Nginx Gateway ──▶ Laravel 12 API (PHP 8.3-FPM)
   └──▶ Flutter Mobile App          ──▶ https://api.example.com/api/v1
                                              │
                                              ├──▶ PostgreSQL 16 (Private VPC/Docker Net)
                                              ├──▶ Redis 7 (Cache / Queue / Session)
                                              └──▶ Local Persistent Storage / S3
```

---

## 2. តម្រូវការមុនពេលដំឡើង (Prerequisites)

- **Operating System**: Ubuntu 22.04 LTS ឬ Ubuntu 24.04 LTS
- **Docker Engine**: Docker 25.x+ និង Docker Compose v2.20+
- **Hardware Specs អប្បបរមា (Minimum)**:
  - CPU: 2 vCPUs (អនុសាសន៍ 4 vCPUs)
  - RAM: 4 GB (អនុសាសន៍ 8 GB)
  - Disk: 50 GB SSD / NVMe
- **Domain Names & DNS**:
  - `www.example.com` & `example.com` (A Record ចង្អុលទៅ IP Server)
  - `admin.example.com` (A Record ចង្អុលទៅ IP Server)
  - `api.example.com` (A Record ចង្អុលទៅ IP Server)

---

## 3. ជំហានដំឡើងលើកដំបូង (Initial Server Setup)

```bash
# 1. Clone Source Code ពី Git Repository មកកាន់ Server
cd /opt
git clone <YOUR_GIT_REPO_URL> enterprise-pos
cd enterprise-pos

# 2. រៀបចំ Environment Variables សម្រាប់ Production
cp backend/.env.production.example backend/.env.production
cp admin-dashboard/.env.production.example admin-dashboard/.env.production
cp customer-website/.env.production.example customer-website/.env.production

# 3. កែប្រែពាក្យសម្ងាត់ និង Domain ជាក់ស្តែងនៅក្នុង backend/.env.production
nano backend/.env.production
# - កំណត់ APP_KEY (php artisan key:generate)
# - កំណត់ DB_PASSWORD (ពាក្យសម្ងាត់ PostgreSQL ខ្លាំង)
# - កំណត់ REDIS_PASSWORD
# - កំណត់ JWT_SECRET

# 4. បង្កើតថតទុក SSL Certificates (ឬប្រើ Let's Encrypt Certbot)
mkdir -p docker/ssl
# ចម្លង fullchain.pem និង privkey.pem ចូលក្នុង docker/ssl/

# 5. Build និង Start Containers ទាំងអស់
docker compose -f docker-compose.prod.yml up -d --build

# 6. Run Database Migrations និង Seeders (លើកដំបូង)
docker exec enterprise_pos_backend_prod php artisan migrate --force
docker exec enterprise_pos_backend_prod php artisan db:seed --force # (ប្រសិនបើត្រូវការទិន្នន័យដំបូង)

# 7. ផ្ទៀងផ្ទាត់សុខភាពប្រព័ន្ធ (Health Check)
curl -I https://api.example.com/api/health
```

---

## 4. ដំណើរការ Zero-Downtime Deployment ស្វ័យប្រវត្តិ

រាល់ពេលដែលមាន Code Update ថ្មីលើ Git `main` branch គ្រាន់តែដំណើរការ Script:

```bash
./scripts/deploy.sh
```

Script នេះនឹងធ្វើសកម្មភាពតាមលំដាប់លំដោយ៖
1. **Backup Database** ដោយស្វ័យប្រវត្តិតាមរយៈ `pg_dump` និង `gzip`។
2. **Git Pull** ទាញយកកូដថ្មីចុងក្រោយ។
3. **Docker Build & Up** បង្កើត Containers ថ្មីដោយមិនធ្វើឱ្យប្រព័ន្ធរអាក់រអួល។
4. **Artisan Migrate** អនុវត្តការកែប្រែ Database ដោយសុវត្ថិភាព (`--force`)។
5. **Optimize Cache** Cache Config, Routes, Views, និង Events សម្រាប់ល្បឿនអតិបរមា។
6. **Restart Queue Workers** Restart Background Jobs ដោយរលូន។
7. **Health Verification** ពិនិត្យសុខភាពប្រព័ន្ធតាម `/api/health`។
