# 🚀 Tutorial 01: Complete Developer Onboarding Guide

## 1. Goal
Step-by-step instructions to get your local environment running all 4 OptaPOS platforms in under 10 minutes.

---

## 2. Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **PHP**: 8.2+ with `pdo_pgsql`, `redis`, `gd`, `bcmath` extensions
- **Composer**: 2.7+
- **Docker & Docker Compose**: For local PostgreSQL 18 & Redis 7
- **Flutter SDK**: 3.24+ (Optional for mobile developers)

---

## 3. Step-by-Step Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/sakouksa/Project-Enterprise-E-Commerce-POS-System.git
cd Project-Enterprise-E-Commerce-POS-System
```

### Step 2: Spin Up Infrastructure (PostgreSQL 18 & Redis 7)
```bash
docker-compose up -d postgres redis
```

### Step 3: Configure and Initialize Backend API
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve --port=8000
```

### Step 4: Launch Admin Dashboard
In a new terminal window:
```bash
cd admin-dashboard
npm install
npm run dev # Runs on http://localhost:5173
```

### Step 5: Launch Customer Website
In a new terminal window:
```bash
cd customer-website
npm install
npm run dev # Runs on http://localhost:5174
```

### Step 6: Launch Documentation Website
In a new terminal window:
```bash
cd docs-website
npm install
npm run dev # Runs on http://localhost:5175
```

---

## 4. Default Seeded Credentials

| Application | URL | Email / Username | Password |
|---|---|---|---|
| **Admin Dashboard** | `http://localhost:5173` | `admin@enterprise.com` | `password123` |
| **Cashier / POS** | `http://localhost:5173/pos` | `cashier@enterprise.com` | `password123` |
| **Backend API Hub** | `http://localhost:8000/api/v1` | N/A | Bearer JWT |

---
*Related Docs:*
- [Master Documentation Hub](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/README.md)
- [DevOps & Docker Manual](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/devops/local-development-docker.md)
