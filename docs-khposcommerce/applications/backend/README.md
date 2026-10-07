# ⚙️ Laravel 12 Backend API Application Manual

## 1. Overview
The **OptaPOS Backend Hub** is an enterprise RESTful application built on **Laravel 12 (PHP 8.2+)** and **PostgreSQL 18**. It serves as the single source of truth for all 4 client applications, exposing 759 REST API endpoints across 74 Controllers.

---

## 2. Architecture & Tech Stack

```
+---------------------------------------------------------------------------------------------------------------+
|                                      BACKEND TECHNICAL STACK                                                  |
+---------------------------------------------------------------------------------------------------------------+
|  Framework          | Laravel 12 on PHP 8.2+                                                                  |
|  Database Engine    | PostgreSQL 18 Alpine (99 Normalized Tables • 36 Migrations)                             |
|  In-Memory / Queue  | Redis 7 Alpine (Sessions, Rate Limits, Job Queues, Dynamic Sitemap Cache)                |
|  Authentication     | tymon/jwt-auth (Dual JWT: Access Token 60m, Refresh Token 14d)                           |
|  Authorization      | Spatie Laravel-Permission v6 (169 Permission Nodes • Multi-Guard)                       |
|  Pattern            | Controller ➜ FormRequest ➜ DomainService ➜ Eloquent Repository ➜ API Resource          |
+---------------------------------------------------------------------------------------------------------------+
```

---

## 3. Directory Layout

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/   # 74 API Controllers grouped by business domain
│   │   │   ├── Auth/             # Login, 2FA, Refresh, Profile
│   │   │   ├── Product/          # Products, Variants, Categories, Brands, Attributes
│   │   │   ├── Inventory/        # Stock levels, Transfers, Adjustments, Valuations
│   │   │   ├── POS/              # Registers, Shifts, Checkout, Split Payments
│   │   │   ├── Purchase/         # Suppliers, POs, Goods Receiving, Bills
│   │   │   ├── Sales/            # Sales orders, Invoices, Delivery, Quotations
│   │   │   ├── Employee/         # Staff, Dynamic QR Attendance, Leaves, Payroll
│   │   │   ├── Finance/          # Accounts, Cash Registers, Expenses
│   │   │   └── Report/           # Sales, Inventory, Tax, Profit/Loss Reports
│   │   ├── Middleware/           # JwtMiddleware, TenantScopeMiddleware, RoleMiddleware
│   │   ├── Requests/             # Form validation classes with strict authorize() rules
│   │   └── Resources/            # JsonResource classes for unified API output formatting
│   ├── Models/                   # 89 Eloquent Models across 21 subdirectories
│   └── Services/                 # Domain Business Services (POSService, InventoryService)
├── config/                       # app.php, database.php, jwt.php, permission.php, cors.php
├── database/
│   ├── migrations/               # 36 PostgreSQL Migration files
│   └── seeders/                  # Role, Permission, Branch, Product, and User Seeders
└── routes/
    └── api.php                   # 759 Versioned API routes under /api/v1/
```

---

## 4. Coding Standard for API Endpoints

Every API endpoint must follow this 5-step flow:
1. **FormRequest**: Validate input and check permissions:
   ```php
   public function authorize(): bool {
       return $this->user()->can('inventory.adjustments.create');
   }
   ```
2. **Controller**: Keep controllers thin; delegate to Domain Service.
3. **Domain Service**: Wrap modifications in `DB::transaction()` and use `lockForUpdate()`.
4. **API Resource**: Transform Eloquent models into predictable camelCase/snakeCase JSON structures.
5. **BaseApiController**: Always return formatted JSON via `sendResponse($data, $message, $code)`.

---
*Related Docs:*
- [API Reference Manual](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/api/README.md)
- [Database Schema & 99 Tables](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/database/README.md)
