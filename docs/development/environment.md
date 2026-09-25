# ⚙️ ម៉ាទ្រីសបរិស្ថាន និង Environment Variables (Environment Matrix)

ឯកសារនេះបង្ហាញពីការប្រៀបធៀប និងការកំណត់ Environment Variables សម្រាប់ Development, Staging, និង Production។

---

## 1. ម៉ាទ្រីសបរិស្ថាន (Environment Matrix Comparison)

| ប៉ារ៉ាម៉ែត្រ (Parameter) | Development (Local) | Staging | Production |
| :--- | :--- | :--- | :--- |
| **Customer Website** | `http://localhost:5173` | `https://staging.example.com` | `https://www.example.com` |
| **Admin Dashboard** | `http://localhost:5174` | `https://admin-staging.example.com` | `https://admin.example.com` |
| **Backend API URL** | `http://127.0.0.1:8001/api/v1` | `https://api-staging.example.com/api/v1` | `https://api.example.com/api/v1` |
| **Flutter Mobile API** | `http://10.0.2.2:8000/api/v1` (Emulator) | `https://api-staging.example.com/api/v1` | `https://api.example.com/api/v1` |
| **APP_ENV** | `local` | `staging` | `production` |
| **APP_DEBUG** | `true` | `true` | `false` |
| **DB_CONNECTION** | `pgsql` | `pgsql` | `pgsql` |
| **DB_HOST** | `127.0.0.1` ឬ `db` | `postgres` | `postgres` (Private Network) |
| **CACHE_STORE** | `database` ឬ `redis` | `redis` | `redis` |
| **QUEUE_CONNECTION** | `database` ឬ `sync` | `redis` | `redis` |
| **SESSION_DRIVER** | `database` | `redis` | `redis` (Secure cookie enabled) |
| **MAIL_MAILER** | `log` | `log` ឬ `smtp` (Sandbox) | `smtp` (SendGrid / SES / Postmark) |
| **TELESCOPE_ENABLED** | `true` | `true` | `false` |

---

## 2. បញ្ជី Environment Variables សំខាន់ៗ និងការពន្យល់

### ក. Laravel Backend (`backend/.env.production`)
- `APP_KEY`: Key 64-bit សម្រាប់ Encrypt Passwords និង Sessions (បង្កើតតាម `php artisan key:generate`)។
- `APP_DEBUG`: ត្រូវតែកំណត់ជា `false` លើ Production ដើម្បីកុំឱ្យបែកធ្លាយ Stack traces និង SQL Queries ទៅកាន់អ្នកប្រើប្រាស់។
- `DB_PASSWORD`: ពាក្យសម្ងាត់ PostgreSQL លើ Production (យ៉ាងតិច 20 តួអក្សរ)។
- `REDIS_PASSWORD`: ពាក្យសម្ងាត់ Redis លើ Production។
- `JWT_SECRET`: Secret Key សម្រាប់ Sign និង Verify Customer & Admin JWT Tokens។
- `CORS_ALLOWED_ORIGINS`: បញ្ជី Allowed Domains ផ្តាច់មុខ (ឧទាហរណ៍ `https://www.example.com,https://admin.example.com`)។

### ខ. React Frontends (`admin-dashboard/.env.production` & `customer-website/.env.production`)
- `VITE_API_BASE_URL`: Endpoint ចម្បងរបស់ API (`https://api.example.com/api/v1`)។
- `VITE_STORE_API_URL`: Endpoint សម្រាប់ Customer Storefront (`https://api.example.com/api/v1/store`)។
- **ចំណាំ**: មិនត្រូវដាក់ Secret Keys ឬ Database Passwords នៅក្នុង Frontends `.env` ឡើយ ពីព្រោះកូដ JavaScript ដំណើរការលើ Browser របស់ User។
