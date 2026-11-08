# Enterprise E-Commerce + POS Backend (Laravel)

An enterprise-grade RESTful API backend powering a Multi-Outlet Point of Sale (POS), E-Commerce Storefront, and ERP back-office platform built on Laravel and PostgreSQL.

---

## 🏛 Architecture & Principles

The backend is built following **Clean Architecture & Domain-Driven Design (DDD)** with **Strict Consumer Separation**:

```
                           API CONSUMERS (Presentation)
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
    ADMIN API              CUSTOMER API              MOBILE API
  (/api/v1/admin/*)       (/api/v1/customer/*)    (/api/v1/mobile/*)
  • Back-Office ERP       • Storefront Website    • POS Cashier App
  • Financials & Reports  • Cart & Checkout       • Inventory Barcode
  • Catalog Management    • Order Tracking        • Staff Mobile
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                     UNIFIED SERVICES LAYER (Core Logic)
         ┌─────────────────────────────────────────────────────────┐
         │ • InventoryService (Stock concurrency locking, rules)   │
         │ • PricingService (Tax, coupons, discounts calculation)  │
         │ • SaleService (POS transaction, invoice generation)     │
         │ • OrderService (Order lifecycle & state transitions)    │
         │ • ProductService, PurchaseService, CustomerService, ... │
         └─────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                     UNIFIED REPOSITORIES LAYER (Data Access)
         ┌─────────────────────────────────────────────────────────┐
         │ • BaseRepository (Eloquent CRUD, Pagination, SoftDelete)│
         │ • Domain Repositories (Order, Product, Inventory, etc.) │
         └─────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
backend/app/
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── Admin/             # Admin Dashboard & ERP back-office endpoints
│   │   ├── Auth/              # Authentication, JWT tokens, profile security
│   │   └── Customer/          # Customer storefront (Cart, Wishlist, Orders, Reviews)
│   ├── Requests/{Domain}/     # Form Request validation rules
│   ├── Resources/{Domain}/    # JSON API response transformers
│   └── Middleware/            # Auth guards, localization, permission interceptors
├── Models/{Domain}/           # Eloquent ORM persistence models
├── Services/{Domain}/         # Core business logic, stock math, transaction engines
├── Repositories/{Domain}/     # Database query abstractions & BaseRepository
├── Jobs/                      # Queued background tasks
├── Events/ & Listeners/       # Domain event listeners & notifications
└── Policies/                  # Spatie role & permission policies
```

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Composer 2+
- PostgreSQL 15+
- Redis (optional, recommended for production queues)

### Setup Instructions
```bash
# 1. Install dependencies
composer install

# 2. Configure environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# 3. Run database migrations & seeders
php artisan migrate --seed

# 4. Start local development server
php artisan serve
```

---

## 🧪 Testing & Verification

```bash
# Run automated test suite
php artisan test

# Check PHP syntax validity across all files
find app config database routes tests -name "*.php" -print0 | xargs -0 -n 1 php -l

# List all registered routes
php artisan route:list
```

---

## 📖 Documentation
Detailed technical documentation is available in the root `docs/` folder:
- [Architecture Guide](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/backend/01-architecture.md)
- [Folder Structure](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/backend/02-folder-structure.md)
- [API Architecture & Routing](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/backend/03-api-architecture.md)
- [Clean Architecture Refactor Report](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/backend/04-clean-architecture-refactor-report.md)
