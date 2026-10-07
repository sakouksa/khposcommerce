# 🏛️ Multi-Channel API Controller Architecture Standard
> **Project:** KHPosCommerce Monorepo  
> **Status:** Standardized & Active  
> **Target Consumers:** Admin Dashboard (ERP), E-Commerce Storefront Website, Flutter Mobile POS / App  

---

## 🎯 1. Mission & Architectural Principle
In KHPosCommerce, the API serves three distinct consumer clients with fundamentally different performance, security, and data requirements:

1. **Admin Dashboard (Back-Office ERP):** Requires full CRUD, multi-tenant branch/company filtering, Spatie RBAC permission checks, comprehensive audit logs, and detailed relationships (cost prices, supplier details, purchase logs).
2. **Customer Website (E-Commerce Storefront):** Public read-heavy, high performance (Redis caching), SEO-friendly URLs (slugs), lightweight responses, strict data privacy (never exposes cost price, margins, or supplier data), customer cart & checkout flows.
3. **Mobile POS App (Flutter / Cashier / Mobile Staff):** Lightweight payloads for low bandwidth, branch-scoped caching, offline delta-sync (SQLite/Isar), fast barcode scanning, Bluetooth thermal receipt generation (58mm/80mm), quick PIN cashier switching.

### 🚫 The Anti-Pattern: Monolithic Single Controller
Never use a single monolithic controller (e.g. `ProductController`) to serve Admin, Website, and Mobile with internal `if ($request->is_admin)` conditionals. This introduces data leaks, bloated payloads, and tight coupling.

### ✅ The Solution: Consumer-Driven Controllers + Shared Domain Service Layer
Controllers are thin and segregated by consumer. All business logic (inventory deduction, tax calculation, discounts, invoice generation) lives in `app/Services/*`.

```
┌───────────────────────┐   ┌────────────────────────┐   ┌───────────────────────┐
│   Admin Dashboard     │   │   E-Commerce Website   │   │   Mobile App / POS    │
│ (React 19 ERP Admin)  │   │  (Next.js / Vite Web)  │   │ (Flutter / Mobile POS)│
└──────────┬────────────┘   └───────────┬────────────┘   └───────────┬───────────┘
           │                            │                            │
     /api/v1/admin/*              /api/v1/customer/*           /api/v1/mobile/*
           │                            │                            │
┌──────────▼────────────┐   ┌───────────▼────────────┐   ┌───────────▼───────────┐
│  Admin Controllers    │   │  Customer Controllers  │   │   Mobile Controllers  │
│ (RBAC, Audit, Full)   │   │  (Public, Cache, Cart) │   │ (Lightweight, Sync)   │
└──────────┬────────────┘   └───────────┬────────────┘   └───────────┬───────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        ▼
           ┌─────────────────────────────────────────────────────────┐
           │        Shared Domain & Service Layer (app/Services/*)   │
           │  • ProductService  • OrderService  • PricingService     │
           │  • InventoryService • PaymentService • TaxService       │
           └────────────────────────────┬────────────────────────────┘
                                        ▼
           ┌─────────────────────────────────────────────────────────┐
           │          Database & Multi-Tenant Query Scopes           │
           └─────────────────────────────────────────────────────────┘
```

---

## 📂 2. Directory Structure

```text
api/backend-khposcommerce/app/Http/Controllers/Api/
├── BaseApiController.php                     <-- Standardized JSON response helpers
└── V1/
    ├── Auth/                                 <-- Shared Authentication & Profile
    │   ├── AuthController.php
    │   ├── ProfileController.php
    │   └── PasswordResetController.php
    │
    ├── Admin/                                <-- 1. Admin Dashboard & Back-Office ERP
    │   ├── Company/                          <-- Company, Branch, Store, Warehouse
    │   ├── Product/                          <-- ProductController (Full CRUD, cost_price, variants)
    │   ├── Inventory/                        <-- Stock transfers, adjustments, ledger
    │   ├── POS/                              <-- Admin POS registers, terminals
    │   ├── Sales/                            <-- Invoices, sales records
    │   ├── Order/                            <-- Fulfillment, status changes
    │   ├── Customer/                         <-- Customer CRM & Credit limits
    │   ├── Employee/                         <-- HR, attendance, payroll
    │   └── Report/                           <-- Executive & P&L reports
    │
    ├── Customer/                             <-- 2. Customer Website Storefront
    │   ├── HomeController.php                <-- Banners, featured sections
    │   ├── CatalogController.php             <-- Categories, brands, product slug detail
    │   ├── SearchController.php              <-- Autocomplete, live search
    │   ├── CartController.php                <-- Cart operations, coupons
    │   ├── CustomerOrderController.php       <-- Storefront checkout & history
    │   └── ContentController.php             <-- Blog, FAQs, pages
    │
    └── Mobile/                               <-- 3. Dedicated Flutter Mobile POS
        ├── MobileAuthController.php          <-- Quick PIN login & session refresh
        ├── MobileDashboardController.php     <-- Branch-scoped counter metrics & hourly chart
        ├── MobilePOSController.php           <-- Barcode scan, fast sale, thermal receipt format
        ├── MobileProductController.php       <-- Touch catalog grid, cross-branch stock
        ├── MobileOrderController.php         <-- Branch orders & customer phone lookups
        └── MobileSyncController.php          <-- Offline delta catalog & batch sales push
```

---

## 🛣️ 3. Route Mapping Standard (`routes/api.php`)

| Consumer Layer | Base URL Prefix | Route File | Primary Auth & Middleware |
| :--- | :--- | :--- | :--- |
| **Public / Landing** | `/api/v1/*` | `routes/api/v1/public.php` | None (Public) |
| **Auth** | `/api/v1/auth/*` | `routes/api/v1/auth.php` | JWT / Guest |
| **Storefront Website** | `/api/v1/storefront/*` (aliases: `/customer/*`, `/store/*`) | `routes/api/v1/storefront.php` | Optional Customer JWT |
| **Merchant ERP & POS** | `/api/v1/merchant/*` (alias: `/admin/*`) | `routes/api/v1/merchant.php` | `auth.jwt`, Spatie RBAC, Tenant |
| **Control (SaaS Platform)** | `/api/v1/control/*` (alias: `/platform/*`) | `routes/api/v1/control.php` | `auth.jwt`, Platform Admin Scope |
| **Mobile POS (Flutter)** | `/api/v1/mobile/*` | `routes/api/v1/mobile.php` | `auth.jwt`, Cashier Branch Scope |

---

## 🛡️ 4. Security & Data Protection Rules
1. **Never Expose Cost Price (`cost_price`) to Storefront or Mobile POS:**
   - Admin uses `AdminProductResource` (includes `cost_price`, `supplier`, `profit_margin`).
   - Storefront uses `FormatsStorefrontData` trait (only `selling_price`, `compare_price`, `discount_percent`).
   - Mobile POS uses `MobileProductController` (returns `selling_price` and branch `stock_qty` only).
2. **Tenant Scoping:**
   - Always derive `company_id` and `branch_id` from `$request->user()`. Never trust `company_id` from request body without validation.
3. **Offline Sync Idempotency:**
   - All mobile offline sales use `client_uuid` to ensure duplicate sales are never recorded twice during network retries.
