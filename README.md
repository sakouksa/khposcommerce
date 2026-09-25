# 🛍️ KHPosCommerce (Enterprise Omnichannel POS & E-Commerce)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=flat&logo=flutter&logoColor=white)](https://flutter.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io)

An enterprise-grade, high-performance unified commerce platform designed for multi-store retail, warehouse distribution networks, and digital e-commerce storefronts.

---

## 🌟 Highlights & Key Features

- 🏢 **Multi-Location Warehouse Inventory**: Real-time stock ledgers, atomic stock updates, inter-warehouse transfers, stock adjustments, and cycle count audits (Opname).
- ⚡ **High-Speed Point of Sale (POS)**: Barcode scanning, customizable cash register shifts, split payments (Cash, ABA PayWay, Bakong KHQR, Cards), receipt printing, and offline tolerance.
- 🌐 **5-Language Internationalization (i18n)**: Native support for **Khmer (`km`)**, **English (`en`)**, **Chinese (`zh`)**, **Thai (`th`)**, and **Vietnamese (`vi`)** across the entire UI.
- 🎨 **Enterprise UI/UX Design**: Clean tabs, customizable column visibility, standardized filter drawers, and dark/light themes.
- 🛒 **Customer E-Commerce Storefront**: Modern web storefront with catalog browsing, shopping cart, promotions, and order tracking.
- 📱 **Mobile Flutter Application**: Mobile POS, camera barcode scanner, and Bluetooth thermal printer drivers.
- 🔒 **Security & Granular RBAC**: JWT/Sanctum bearer token authentication with granular permissions for cashiers, inventory managers, and admins.

---

## 🏛️ Monorepo Architecture Layout

```text
khposcommerce/
│
├── 📁 webclient/
│   │
│   ├── 📁 admin-khposcommerce/
│   │   └── # Admin Dashboard & Web POS
│   │
│   └── 📁 storefront-khposcommerce/
│       └── # Customer E-Commerce Website
│
├── 📁 api/
│   │
│   └── 📁 backend-khposcommerce/
│       ├── app/
│       ├── bootstrap/
│       ├── config/
│       ├── database/
│       ├── public/
│       ├── resources/
│       ├── routes/
│       ├── storage/
│       ├── tests/
│       ├── .env
│       └── artisan
│
├── 📁 mobile/
│   │
│   └── 📁 app-khposcommerce/
│       ├── android/
│       ├── ios/
│       ├── lib/
│       ├── test/
│       ├── assets/
│       └── pubspec.yaml
│
├── 📁 packages/
│   │
│   ├── 📁 ui/
│   │   └── # Shared UI Components
│   │
│   ├── 📁 config/
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   ├── 📁 types/
│   │   └── # Shared TypeScript Types
│   │
│   ├── 📁 utils/
│   │   └── # Shared Utilities
│   │
│   └── 📁 database/
│       └── # Shared Database Schema / Types
│
├── 📁 infrastructure/
│   │
│   ├── 📁 docker/
│   ├── 📁 nginx/
│   ├── 📁 scripts/
│   └── 📁 deployment/
│
├── 📁 docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── deployment/
│   └── development/
│
├── 📄 docker-compose.yml
├── 📄 package.json
├── 📄 pnpm-workspace.yaml
├── 📄 .gitignore
├── 📄 .env.example
└── 📄 README.md
```

---

## 🚀 Quick Start Guide

### 1. One-Time Setup

```bash
# Install root & workspace packages
npm install

# Setup Laravel Backend API
cd api/backend-khposcommerce
composer install
cp -n .env.example .env
php artisan key:generate
php artisan migrate --seed
cd ../..
```

Or run the automated setup script:
```bash
./infrastructure/scripts/setup.sh
```

---

### 2. Run Applications

```bash
# ⚡ Recommended for Solo Dev: Run API + Admin/POS concurrently
npm run dev

# 🛒 Run API + Admin/POS + Storefront
npm run dev:all

# 📱 Run Flutter Mobile POS
npm run dev:mobile
```

> **Direct Access URLs:**
> - **Admin Dashboard & Web POS**: [http://localhost:5174](http://localhost:5174)
> - **Customer Storefront**: [http://localhost:5173](http://localhost:5173)
> - **Laravel API Backend**: [http://localhost:8001](http://localhost:8001)

---

### 3. Run with Docker Compose

```bash
# Start all services with Docker
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop Docker services
docker compose down
```

---

## 📚 Documentation Index

All architectural specifications, database models, and API definitions are maintained in the [**docs**](./docs/README.md) directory:

- 🏗️ [System Architecture & Overview](./docs/architecture/system-overview.md)
- ⚙️ [Backend Architecture & Patterns](./docs/architecture/backend-architecture.md)
- 🖥️ [Frontend Architecture & UI System](./docs/architecture/frontend-architecture.md)
- 📱 [Mobile App Architecture](./docs/architecture/mobile-architecture.md)
- 🔌 [API Overview & Standards](./docs/api/overview.md)
- 🔌 [API Endpoints Catalog](./docs/api/endpoints.md)
- 🗄️ [Database Schema & ERD](./docs/database/schema-overview.md)
- 🗄️ [Data Dictionary](./docs/database/data-dictionary.md)
- 🚀 [Deployment Guide](./docs/deployment/deployment-guide.md)
- 🛠️ [Development Guide](./docs/development/development-guide.md)

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
