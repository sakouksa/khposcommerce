# Enterprise Laravel Backend Architecture

## Overview
This enterprise platform powers an integrated **E-Commerce + Multi-Outlet POS + ERP System** utilizing Laravel 11/12 with PostgreSQL.

The architecture follows **Clean Architecture & Domain-Driven Design (DDD)** principles with **Strict API Consumer Separation**:

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
                                 │
                                 ▼
                     PERSISTENCE & INFRASTRUCTURE
         ┌─────────────────────────────────────────────────────────┐
         │ • Eloquent Models (PostgreSQL)                          │
         │ • Redis Caching & Queues (Jobs, Listeners)              │
         │ • Media Storage, PDF/Receipt Generation, Mail/SMS       │
         └─────────────────────────────────────────────────────────┘
```

## Core Architectural Principles

1. **Single Source of Truth**: Business rules for inventory deduction, purchase receiving, order status transitions, and pricing calculations reside entirely in the **Unified Services Layer (`app/Services/{Domain}/`)**. They are NEVER duplicated across Admin, Customer, and Mobile.
2. **Consumer-Tailored Presentation**: Admin, Customer, and Mobile have distinct API route files (`routes/api/v1/{admin,customer,mobile,public,auth}.php`) and controllers (`App\Http\Controllers\Api\V1\{Admin, Customer, Auth}\`) with tailored responses, validation, and permission boundaries.
3. **100% Backward Compatibility**: Legacy routes such as `/api/v1/store/*` and direct `/api/v1/*` endpoints are fully preserved through router aliases.
4. **Predictable Onboarding**: Every domain follows the exact same hierarchy:
   - `Http/Controllers/Api/V1/{Consumer}/{Domain}/`
   - `Http/Requests/{Domain}/`
   - `Http/Resources/{Domain}/`
   - `Services/{Domain}/`
   - `Repositories/{Domain}/`
   - `Models/{Domain}/`
