# 📘 មគ្គុទ្ទេសក៍វិភាគស្ថាបត្យកម្មប្រព័ន្ធ & មេរៀនបង្រៀនពេញលេញ (Enterprise POS & E-Commerce System Masterclass)

> **Official Comprehensive Architectural Audit, Developer Reference & Teaching Guide**  
> **Project**: Project-Enterprise-E-Commerce & POS System  
> **Target Ecosystem**: Laravel 11 Backend (Multi-Tenant API) + React 19 Admin & POS + React 19 Customer Website + Flutter Mobile Terminal

---

## 📑 តារាងមាតិកា (Table of Contents)

1. [PART 1 — ទិដ្ឋភាពទូទៅនៃគម្រោង (Project Overview)](#part-1--project-overview)
2. [PART 2 — វិភាគរចនាសម្ព័ន្ធ Folder និង File (Project Structure Analysis)](#part-2--project-structure-analysis)
3. [PART 3 — អ្វីដែលបានអនុវត្តជោគជ័យ (What Has Already Been Done)](#part-3--what-has-already-been-done)
4. [PART 4 — ប្រវត្តិការកែសម្រួលបញ្ហា (Change History & Fixed Problems)](#part-4--change-history--fixed-problems)
5. [PART 5 — លំហូរទិន្នន័យពីមុខទៅក្រោយ (Request / Response Flow)](#part-5--request--response-flow)
6. [PART 6 — ការវិភាគ Database & Relationships (Database Architecture)](#part-6--database-analysis)
7. [PART 7 — ការវិភាគស៊ីជម្រៅលើ Backend (Backend Architecture Deep-Dive)](#part-7--backend-analysis)
8. [PART 8 — ការវិភាគស៊ីជម្រៅលើ Frontend (Frontend Architecture Deep-Dive)](#part-8--frontend-analysis)
9. [PART 9 — សុវត្ថិភាព និងការគ្រប់គ្រងសិទ្ធិ (Authentication & Multi-Tenant RBAC)](#part-9--authentication--authorization)
10. [PART 10 — តក្កវិជ្ជាអាជីវកម្មស្នូល (Core Business Logic)](#part-10--business-logic)
11. [PART 11 — ការវិភាគហានិភ័យ និងចំណុចកែលម្អ (Error & Risk Analysis)](#part-11--error--bug-analysis)
12. [PART 12 — តារាងវាយតម្លៃគុណភាពកូដ (Code Quality Scorecard)](#part-12--code-quality-analysis)
13. [PART 13 — ផែនទីបង្ហាញផ្លូវសម្រាប់អ្នករៀន (Developer Learning Roadmap)](#part-13--developer-learning-roadmap)
14. [PART 14 — មេរៀនបង្រៀន ១០ ដំណាក់កាល (10-Stage Teaching Curriculum)](#part-14--teaching-mode)
15. [PART 15 — គំរូបង្រៀនមុខងារជាក់ស្តែង (Feature Masterclass: Product Management)](#part-15--feature-masterclass)
16. [PART 16 — វិធីសាស្ត្រពន្យល់បែប Senior Architect (Explain Like an Architect)](#part-16--explain-like-a-teacher)
17. [PART 17 — ការពន្យល់តាម ៣ កម្រិត (Beginner -> Intermediate -> Advanced)](#part-17--level-based-explanations)
18. [PART 18 — ភស្តុតាងជាក់ស្តែងក្នុងកូដ (Real Project Code Evidence)](#part-18--real-project-examples)
19. [PART 19 — របាយការណ៍សវនកម្មប្រព័ន្ធចុងក្រោយ (Final Project Audit Report)](#part-19--final-project-report)
20. [PART 20 — តារាងសង្ខេប Feature ទាំងអស់ (Master Summary Table)](#part-20--final-summary-table)
21. [PART 21 — សេចក្តីសន្និដ្ឋាន និងតម្លៃនៃការបង្រៀន (Conclusion & Educational Value)](#part-21--conclusion)

---

# PART 1 — PROJECT OVERVIEW (ទិដ្ឋភាពទូទៅនៃគម្រោង)

```
                                  ┌─────────────────────────────────────────────────────────┐
                                  │                     CLIENT LAYER                        │
                                  │                                                         │
                                  │  ┌────────────────────┐ ┌─────────────────────────────┐  │
                                  │  │  React 19 Admin &  │ │   React 19 Storefront       │  │
                                  │  │    POS Terminal    │ │    (Customer Website)       │  │
                                  │  └─────────┬──────────┘ └──────────────┬──────────────┘  │
                                  │            │                           │                 │
                                  │            │   ┌───────────────────┐   │                 │
                                  │            └───┤  Flutter Mobile   ├───┘                 │
                                  │                │     Terminal      │                     │
                                  │                └─────────┬─────────┘                     │
                                  └──────────────────────────┼───────────────────────────────┘
                                                             │ HTTPS (JSON / REST API)
                                                             ▼
                                  ┌─────────────────────────────────────────────────────────┐
                                  │               LARAVEL 11 BACKEND GATEWAY                │
                                  │                                                         │
                                  │  ┌───────────────────────────────────────────────────┐  │
                                  │  │  Routing & Security Middleware Layer              │  │
                                  │  │  (Sanctum Auth, Spatie RBAC, Tenant Isolation)    │  │
                                  │  └─────────────────────┬─────────────────────────────┘  │
                                  │                        ▼                                │
                                  │  ┌───────────────────────────────────────────────────┐  │
                                  │  │  Business Services & Transaction Orchestration     │  │
                                  │  │  - OrderService      - PosSaleService             │  │
                                  │  │  - InventoryService  - FileStorageService         │  │
                                  │  └─────────────────────┬─────────────────────────────┘  │
                                  │                        ▼                                │
                                  │  ┌───────────────────────────────────────────────────┐  │
                                  │  │  FormatsMediaUrl & Resource Transformation Layer   │  │
                                  │  └─────────────────────┬─────────────────────────────┘  │
                                  └────────────────────────┼────────────────────────────────┘
                                                           │
                                             ┌─────────────┴─────────────┐
                                             ▼                           ▼
                              ┌───────────────────────────┐ ┌──────────────────────────┐
                              │     DATABASE & CACHE      │ │     STORAGE & MEDIA      │
                              │ - PostgreSQL / MySQL      │ │ - storage/app/public     │
                              │ - Redis Query & Tag Cache │ │ - Live Streamed Storage  │
                              └───────────────────────────┘ └──────────────────────────┘
```

### ១. ព័ត៌មានលម្អិតនៃគម្រោង (System Metadata)
1. **Project Name**: Enterprise Multi-Branch E-Commerce & Point of Sale (POS) Omnichannel System.
2. **Project Purpose**: ផ្ដល់នូវហេដ្ឋារចនាសម្ព័ន្ធគ្រប់គ្រងអាជីវកម្មបែបទំនើប (ERP + POS + E-Commerce) ដែលភ្ជាប់ការលក់នៅហាងផ្ទាល់ (Offline POS), ការបញ្ជាទិញតាមអនឡាញ (Online Storefront), និងការគ្រប់គ្រងឃ្លាំងទំនិញរួមគ្នាក្នុង Database តែមួយ។
3. **Business Purpose**: លុបបំបាត់បញ្ហាស្តុកមិនស៊ីគ្នា (Stock Discrepancy), គាំទ្រការគ្រប់គ្រងច្រើនសាខា (Multi-Branch/Multi-Warehouse), គាំទ្រការបង់ប្រាក់បែបឌីជីថល (KHQR, Cash, Card, Split Payment), និងផ្ដល់របាយការណ៍ហិរញ្ញវត្ថុ/ចំណេញ-ខាត (P&L, Cost of Goods Sold) ជាក់ស្ដែងភ្លាមៗ។
4. **Target Users**:
   * **Super Admin / Business Owner**: គ្រប់គ្រងក្រុមហ៊ុន, កំណត់សិទ្ធិ, មើលរបាយការណ៍ហិរញ្ញវត្ថុរួម។
   * **Branch Manager / Cashier**: បើក/បិទវេនកាហ្វេ-លក់ (Shift & Cash Drawer), គិតលុយតាម POS, Scan Barcode, ចេញវិក្កយបត្រ។
   * **Warehouse Keeper**: ទទួលទំនិញពី Supplier, ផ្ទេរទំនិញរវាងឃ្លាំង (Stock Transfer), ធ្វើ Stock Adjustment/Audit។
   * **Online Shopper (Customer)**: រកមើលទំនិញ, បញ្ជាទិញចូល Cart, Checkout, មើលប្រវត្តិ និងតាមដានការដឹកជញ្ជូន (Tracking)។
5. **Technology Stack**:
   * **Backend**: PHP 8.2+ / Laravel 11, Laravel Sanctum, Spatie Laravel-Permission, Spatie Activitylog, Intervention Image។
   * **Database**: MySQL 8.0+ / PostgreSQL 15+, Redis Cache & Queue Driver។
   * **Admin Dashboard & POS**: React 19, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, Zustand, Lucide React, Framer Motion។
   * **Customer Website**: React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Helmet Async (SEO), i18next (Khmer/English/Chinese/Thai/Vietnamese)។
   * **Mobile Application**: Flutter 3.20+, Dart, Dio Client, CachedNetworkImage, Flutter Secure Storage, Riverpod State Management។

---

# PART 2 — PROJECT STRUCTURE ANALYSIS (វិភាគរចនាសម្ព័ន្ធ Folder)

```
Project-Enterprise-E-Commerce-POS-System/
├── backend/                  # Laravel 11 Core API & Business Layer
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # REST API Controllers (POS, Orders, Products, HR, Auth)
│   │   │   ├── Middleware/   # Authenticate, TenantScope, PermissionCheck
│   │   │   ├── Requests/     # Form Validation Rules
│   │   │   └── Resources/    # Data Transformation & FormatsMediaUrl Trait
│   │   ├── Models/           # Eloquent Models & SoftDeletesEnterprise
│   │   └── Services/         # Pure Business Logic (Inventory, POS, Orders, Files)
│   ├── config/               # filesystems.php, cors.php, sanctum.php, database.php
│   ├── database/migrations/  # 36 Enterprise Migration Schemas
│   └── routes/api.php        # Versioned RESTful API Endpoints (/api/v1/...)
├── admin-dashboard/          # React 19 Enterprise Administration & POS SPA
│   ├── src/
│   │   ├── api/client.ts     # Axios Interceptors, JWT Refresh & Live API Routing
│   │   ├── components/
│   │   │   ├── common/       # AppImage, AvatarImage, BrandLogo, StatusBadge
│   │   │   └── shared/       # DataTable, Pagination, TableWrapper, Drawers
│   │   ├── pages/            # POSPage, ProductsPage, InventoryPage, OrdersPage
│   │   ├── stores/           # Zustand AuthStore, CartStore, CompanyStore
│   │   └── utils/image.ts    # Canonical resolveMediaUrl() & Dynamic Fallback Engine
├── customer-website/         # React 19 Modern Customer Storefront SPA
│   ├── src/
│   │   ├── components/       # ProductCard, ImageWithFallback, Header, Footer
│   │   ├── pages/            # HomePage, ProductDetailPage, CartPage, CheckoutPage
│   │   ├── services/         # productService, orderService, cartService
│   │   └── lib/utils.ts      # Canonical getImageUrl() & Multi-Tier Resolution
├── mobile_app/               # Flutter Cross-Platform Mobile POS Terminal
│   └── lib/
│       ├── core/network/     # DioClient with Render Production Fallback
│       ├── core/widgets/     # AppNetworkImage with CachedNetworkImage & Shimmer
│       └── features/         # POS, Catalog, Auth, Profile
└── docs/                     # Architecture, Image Storage & Hosting Manuals
```

---

# PART 3 — WHAT HAS ALREADY BEEN DONE (លទ្ធផលសម្រេចបានតាម Feature)

### Feature 1: Unified Global Media & Image Storage Architecture
* **Status**: ✅ **COMPLETED**
* **Implemented**: 
  1. បង្កើត `backend/app/Http/Resources/Traits/FormatsMediaUrl.php` ដើម្បី serialize រូបភាពទាំងអស់ចេញពី API ទៅជា Absolute HTTPS Production URL។
  2. បង្កើត Canonical Resolver `resolveMediaUrl()` ក្នុង `admin-dashboard/src/utils/image.ts` និង `customer-website/src/lib/utils.ts` ដែលកាត់ចោលបញ្ហា Hardcoded Localhost/Port និង Rewrite DB seeds មក Live Storage ដោយស្វ័យប្រវត្តិ។
  3. បង្កើត Universal `<AppImage />` និង `<AvatarImage />` ក្នុង `admin-dashboard/src/components/common/` និង `AppNetworkImage` ក្នុង Flutter។
* **Files**: `FormatsMediaUrl.php`, `image.ts`, `AppImage.tsx`, `AvatarImage.tsx`, `ImageWithFallback.tsx`, `app_network_image.dart`។
* **Database**: `products`, `product_images`, `product_variants`, `companies`, `employees`, `customers`, `users`, `brands`, `categories`, `banners`, `blogs`។

### Feature 2: High-Speed POS Terminal & Real-Time Checkout
* **Status**: ✅ **COMPLETED**
* **Implemented**: 
  1. Cashier Session & Cash Register Drawer (Open Shift / Close Shift ជាមួយ Cash in Drawer calculation)។
  2. Barcode Scanning, Category Filter, Grid View / Compact View, Quick Add to Cart, Customer Selection & Loyalty Point integration។
  3. Multiple Payment Methods (Cash with Change Calculator, Dynamic KHQR, Credit Card, Split Payment)។
  4. Hold Sale / Recall Sale (សម្រាប់ករណីអតិថិជនរង់ចាំ) និង Auto Receipt Printing / Print Receipt Preview។
* **Files**: `admin-dashboard/src/pages/pos/POSPage.tsx`, `backend/app/Http/Controllers/Api/V1/POS/PosController.php`, `backend/app/Services/POS/PosSaleService.php`។
* **Database**: `cash_registers`, `cash_register_sessions`, `sales`, `sale_items`, `sale_payments`, `held_sales`។

### Feature 3: Inventory & Warehouse Multi-Branch Movement Engine
* **Status**: ✅ **COMPLETED**
* **Implemented**: 
  1. Multi-Warehouse Stock Tracking (Stock per Branch, Reserved Stock, Alert Stock)។
  2. Stock Movements Ledger (In, Out, Transfer, Adjustment, Sale, Purchase, Damage, Return)។
  3. Stock Transfer Workflow (Draft -> Pending -> In Transit -> Completed)។
* **Files**: `backend/app/Services/Inventory/InventoryService.php`, `admin-dashboard/src/pages/inventory/InventoryPage.tsx`។
* **Database**: `inventories`, `inventory_movements`, `inventory_adjustments`, `stock_transfers`។

### Feature 4: Full Multi-Tenant RBAC Authentication & Activity Logging
* **Status**: ✅ **COMPLETED**
* **Implemented**: 
  1. Sanctum API Token Authentication + JWT Refresh Rotation + Rate Limiting + Device/IP Tracker។
  2. Spatie Dynamic Roles & Permissions (Super Admin, Branch Manager, Cashier, Stock Manager)។
  3. Complete System Audit Trail តាមដានគ្រប់សកម្មភាព Create/Update/Delete តាមរយៈ Spatie Activitylog។
* **Files**: `backend/app/Http/Controllers/Api/V1/Auth/AuthController.php`, `backend/app/Models/User.php`, `admin-dashboard/src/stores/authStore.ts`។
* **Database**: `users`, `roles`, `permissions`, `activity_log`, `login_histories`។

---

# PART 4 — CHANGE HISTORY / WHAT WAS FIXED (ប្រវត្តិបញ្ហា និងដំណោះស្រាយ)

```
                     ┌────────────────────────────────────────────────────────────┐
                     │                         PROBLEM 1                          │
                     │  Admin Product Images & Edit Media Gallery Broken on Vercel│
                     └─────────────────────────────┬──────────────────────────────┘
                                                   ▼
                     ┌────────────────────────────────────────────────────────────┐
                     │                        ROOT CAUSE                          │
                     │ 1. Missing .env.production on Vercel build (API URL unset) │
                     │ 2. Vercel deployed from 'main' while code was on 'develop' │
                     │ 3. ProductMediaSection lacked dynamic onError fallback     │
                     └─────────────────────────────┬──────────────────────────────┘
                                                   ▼
                     ┌────────────────────────────────────────────────────────────┐
                     │                         SOLUTION                           │
                     │ 1. Created .env.production & safe client.ts fallback       │
                     │ 2. Merged develop into main & pushed to GitHub             │
                     │ 3. Created ProductThumbnail & AppImage with multi-tier     │
                     │    category image and SVG monogram fallbacks               │
                     └────────────────────────────────────────────────────────────┘
```

---

# PART 5 — REQUEST / RESPONSE FLOW (លំហូរដំណើរការទិន្នន័យពីមុខទៅក្រោយ)

### ឧទាហរណ៍៖ ការបង្កើតការលក់តាម POS Terminal (POS Sale Checkout Flow)

```
[Cashier Taps "Pay $81.20"]
       │
       ▼
[POSPage.tsx: handleCheckoutSubmit()]
       │
       ▼
[posService.createSale(payload)] ──(Axios POST /api/v1/pos/sales with Bearer Token)──► [Laravel Router api.php]
                                                                                               │
                                                                                               ▼
                                                                                   [Middleware: auth:sanctum]
                                                                                               │
                                                                                               ▼
                                                                                   [PosController::store(StorePosSaleRequest)]
                                                                                               │
                                                                                               ▼
                                                                                   [PosSaleService::createSale()]
                                                                                               │
                                              ┌────────────────────────────────────────────────┴───────────────────────────┐
                                              ▼                                                                            ▼
                                   [DB::beginTransaction()]                                                     [Validate Stock In Warehouse]
                                              │                                                                            │
                                              ▼                                                                            ▼
                                   [Insert into `sales`]                                                        [Deduct `inventories.quantity`]
                                              │                                                                            │
                                              ▼                                                                            ▼
                                   [Insert `sale_items`]                                                        [Insert `inventory_movements` (SALE)]
                                              │                                                                            │
                                              ▼                                                                            ▼
                                   [Insert `sale_payments`]                                                     [DB::commit()]
                                              │
                                              ▼
                                   [Return PosSaleResource JSON (201 Created)]
                                              │
                                              ▼
[React Query invalidates ['sales', 'inventory', 'dashboard']] ──► [Receipt Modal Opens & Cash Drawer Kicks Open]
```

---

# PART 6 — DATABASE ARCHITECTURE & RELATIONSHIPS

```
   ┌────────────────┐          ┌────────────────┐          ┌────────────────┐
   │   companies    │1        *│    branches    │1        *│   warehouses   │
   │────────────────│──────────│────────────────│──────────│────────────────│
   │ id (PK)        │          │ id (PK)        │          │ id (PK)        │
   │ name           │          │ company_id(FK) │          │ branch_id (FK) │
   │ logo           │          │ name           │          │ name           │
   └───────┬────────┘          └────────────────┘          └───────┬────────┘
           │1                                                      │1
           │                                                       │
           │*                                                      │*
   ┌───────┴────────┐          ┌────────────────┐          ┌───────┴────────┐
   │    products    │1        *│product_variants│1        *│  inventories   │
   │────────────────│──────────│────────────────│──────────│────────────────│
   │ id (PK)        │          │ id (PK)        │          │ id (PK)        │
   │ company_id(FK) │          │ product_id(FK) │          │ warehouse_id(FK│
   │ category_id(FK)│          │ sku            │          │ variant_id(FK) │
   │ brand_id (FK)  │          │ price          │          │ quantity       │
   │ name           │          │ image          │          │ reserved_qty   │
   └───────┬────────┘          └───────┬────────┘          └────────────────┘
           │1                          │1
           │                           │
           │*                          │*
   ┌───────┴────────┐          ┌───────┴────────┐          ┌────────────────┐
   │     sales      │1        *│   sale_items   │*        1│    payments    │
   │────────────────│──────────│────────────────│──────────│────────────────│
   │ id (PK)        │          │ id (PK)        │          │ id (PK)        │
   │ branch_id (FK) │          │ sale_id (FK)   │          │ sale_id (FK)   │
   │ cashier_id(FK) │          │ variant_id(FK) │          │ method (KHQR..)│
   │ total_amount   │          │ quantity       │          │ amount         │
   │ status         │          │ unit_price     │          │ reference_no   │
   └────────────────┘          └────────────────┘          └────────────────┘
```

---

# PART 7 — BACKEND DEEP-DIVE (ការវិភាគស្រទាប់ BACKEND)

### ១. Form Requests & Input Sanitization
* គ្រប់ Mutation ទាំងអស់មិនអនុញ្ញាតឱ្យយក `$request->all()` ផ្ទាល់ចូល Database ឡើយ។
* ត្រូវឆ្លងកាត់ Form Request Classes ដូចជា `StoreProductRequest`, `UpdateProductRequest`, `StorePosSaleRequest` ដើម្បីផ្ទៀងផ្ទាត់ Type, File Mimes, និង Foreign Keys។

### ២. Service Pattern & Database Transactions
* Controller ដើរតួត្រឹមតែជា **HTTP Traffic Coordinator** ប៉ុណ្ណោះ។
* រាល់ Business Calculations, Stock Deduction, និង Ledger Logging ស្ថិតនៅក្នុង `app/Services/` ក្រោម `DB::transaction(function() { ... })` ដើម្បីការពារបញ្ហា Partial Writes (Data Corruption ពេលមាន Error កណ្តាលផ្លូវ)។

### ៣. Traits & Code Reusability
* `SoftDeletesEnterprise`: ជួយគ្រប់គ្រងការលុបបែបសុវត្ថិភាព (Soft Delete) ដោយមិនបាត់បង់ប្រវត្តិលក់។
* `FormatsMediaUrl`: ធានាថារាល់ Output Resource បម្លែង Path រូបភាពចេញមកជា HTTPS URL ត្រឹមត្រូវជានិច្ច។

---

# PART 8 — FRONTEND DEEP-DIVE (ការវិភាគស្រទាប់ FRONTEND)

### ១. React 19 + TanStack Query v5 Architecture
* ប្រើប្រាស់ TanStack Query សម្រាប់ **Server State Caching**៖
  * `staleTime: 5 * 60 * 1000` (ទិន្នន័យនៅស្រស់ ៥ នាទី កាត់បន្ថយ Request ទៅកាន់ Server)។
  * `keepPreviousData: true` ពេលធ្វើ Pagination និង Search ធ្វើឱ្យ UI រលូន មិនរលាក់ (Zero UI Jitter)។
* ប្រើប្រាស់ Zustand សម្រាប់ **Client Synchronous State** (Auth Token, POS Cart Items, Sidebar Toggle, Active Theme)។

### ២. Resilience UI Components
* `<AppImage />`: បង្កប់ Shimmer Skeleton អំឡុងពេលទាញយករូបភាព និងមាន Dynamic Fallback ស្វ័យប្រវត្តិតាម Category ទំនិញ ធានាថាគ្មានប្រអប់ Broken Icon លេចឡើងលើអេក្រង់ឡើយ។
* `<AvatarImage />`: បង្កើត Monogram Initials ស្វ័យប្រវត្តិពីឈ្មោះ (ឧទាហរណ៍៖ "Sok San" -> "SS") ជាមួយពណ៌ Gradient យ៉ាងទាក់ទាញ។

---

# PART 9 — AUTHENTICATION & MULTI-TENANCY (សុវត្ថិភាព និងការគ្រប់គ្រងសិទ្ធិ)

1. **Authentication (អ្នកណាជាអ្នកប្រើ?)**:
   * ដំណើរការតាមរយៈ **Laravel Sanctum Bearer Token**។
   * រាល់ Request ត្រូវភ្ជាប់ `Authorization: Bearer <token>` ក្នុង HTTP Header។
2. **Authorization (តើគាត់មានសិទ្ធិធ្វើអ្វី?)**:
   * ប្រើប្រាស់ **Spatie Laravel-Permission**។
   * ពិនិត្យសិទ្ធិតាម Middleware (ឧ. `permission:products.create|products.edit`)។
3. **Tenant & Branch Isolation**:
   * រាល់ Query ទាំងអស់ត្រូវបានចងភ្ជាប់ដោយស្វ័យប្រវត្តិជាមួយ `company_id` និង `branch_id` របស់អ្នកប្រើប្រាស់ដែលបាន Login។ ធ្វើឱ្យសាខានីមួយៗមិនអាចមើលឃើញ ឬកែប្រែទិន្នន័យរបស់សាខាផ្សេងដោយគ្មានការអនុញ្ញាតឡើយ។

---

# PART 10 — BUSINESS LOGIC HIGHLIGHTS (តក្កវិជ្ជាអាជីវកម្មស្នូល)

### តក្កវិជ្ជាគិតលុយ និងកាត់ស្តុក (POS Checkout & Stock Reconciliation):
1. **ពិនិត្យសមតុល្យស្តុក (Check Available Stock)**: ធានាថាស្តុកក្នុងឃ្លាំងជាក់ស្ដែង `>=` ចំនួនដែលកំពុងលក់។
2. **គណនាតម្លៃ (Price & Discount Math)**:
   $$\text{Subtotal} = \sum (\text{Qty} \times \text{Unit Price})$$
   $$\text{Tax Amount} = (\text{Subtotal} - \text{Discount}) \times \frac{\text{Tax Rate}}{100}$$
   $$\text{Grand Total} = \text{Subtotal} - \text{Discount} + \text{Tax Amount} + \text{Shipping}$$
3. **កាត់ស្តុកភ្លាមៗ (Instant Atomic Deduction)**:
   * បន្ថយចំនួនក្នុង `inventories.quantity`។
   * កត់ត្រាចូល `inventory_movements` ជាមួយ Type `SALE` និង Reference `sale_id`។
4. **កត់ត្រាហិរញ្ញវត្ថុវេនលក់ (Cash Drawer Session Reconciliation)**:
   * បូកបញ្ចូលប្រាក់ចំណូលតាម Method នីមួយៗ (Cash, KHQR, Card) ទៅក្នុង Cash Register Session បច្ចុប្បន្ន។

---

# PART 11 — ERROR & RISK AUDIT (ការវិភាគហានិភ័យ និងចំណុចកែលម្អ)

> [!WARNING]
> **ចំនុចគួរប្រុងប្រយ័ត្ន (Architectural Observations - Read-Only)**:
> 1. **High Concurrency Stock Race Conditions**: ប្រសិនបើមាន Cashiers ច្រើននាក់ចុចលក់ទំនិញដែលមានស្តុកចុងក្រោយត្រឹម ១ គ្រាប់ក្នុងពេលតែមួយមីលីវិនាទី អាចប្រឈមមុខនឹង Overselling ប្រសិនបើមិនប្រើ `lockForUpdate()` ក្នុង SQL Query ពេលពិនិត្យស្តុក។
> 2. **Large Export Memory Spikes**: ការ Export Excel/CSV ទិន្នន័យរាប់ម៉ឺនជួរ គួរប្រើប្រាស់ Laravel `LazyCollection` ឬ `cursor()` ជាជាង `get()` ដើម្បីកុំឱ្យអស់ Memory របស់ Server (OOM Error)។

---

# PART 12 — CODE QUALITY SCORECARD (តារាងវាយតម្លៃគុណភាពកូដ)

| លក្ខណៈវិនិច្ឆ័យ (Metric) | ពិន្ទុ (Score) | មូលហេតុ និងសំអាង (Justification) |
| :--- | :---: | :--- |
| **Architecture** | **9.5/10** | ការបែងចែក Layer យ៉ាងដាច់ស្រឡះរវាង Controller, Service, Request, Resource និង Storefront។ |
| **Backend Code** | **9.0/10** | ប្រើប្រាស់ Laravel 11 Standards ពេញលេញ, មាន Type Hinting, Transactions, និង Trait Reusability។ |
| **Frontend Code** | **9.5/10** | React 19 + TypeScript ស្អាត, មាន TanStack Query Caching, Zustand, Error Fallbacks និង 0 Layout Shift។ |
| **Database Design** | **9.5/10** | Normalization ត្រឹមត្រូវ, មាន Foreign Key Constraints, Indexes, និង Audit Log Columns។ |
| **Security & Auth** | **9.0/10** | Sanctum Token, Spatie RBAC, Tenant Isolation, Form Validation, XSS/CORS Protection។ |
| **Maintainability** | **9.5/10** | Code មានរចនាសម្ព័ន្ធងាយយល់, មាន Reusable UI Components, និងឯកសារ Technical Docs ពេញលេញ។ |
| **Scalability** | **9.0/10** | គាំទ្រ Multi-Branch, Multi-Warehouse, Redis Caching, និង Stateless REST API Ready for CDN/Load Balancer។ |
| **TOTAL SCORE** | **9.3 / 10** | **កម្រិត Excellent — Enterprise Grade Production Ready System** |

---

# PART 13 — DEVELOPER LEARNING ROADMAP (ផែនទីបង្ហាញផ្លូវសម្រាប់អ្នករៀន)

```
[Beginner]
   │ 1. ស្វែងយល់ពី Folder Structure & Environment Configurations (.env, vite.config.ts)
   │ 2. រៀនពី Eloquent Models & DB Migrations (Foreign Keys, Relationships)
   │ 3. រៀនបង្កើត Basic CRUD ជាមួយ Form Requests & API Resources
   ▼
[Intermediate]
   │ 4. ស្វែងយល់ពី Authentication & Authorization (Sanctum Tokens, Spatie Roles)
   │ 5. រៀនពី State Management (Zustand) & Server State Caching (TanStack React Query)
   │ 6. អនុវត្ត File Upload, Image Serialization & Fallback Strategy (FormatsMediaUrl)
   ▼
[Advanced / Architect]
   │ 7. បង្កើត Business Services ជាមួយ Database Transactions & Concurrency Locking
   │ 8. រៀបចំ Multi-Branch / Multi-Tenant Isolation Middleware
   │ 9. Performance Optimization (Redis Tag Caching, Code Splitting, CDN Streaming)
```

---

# PART 14 — TEACHING MODE (មេរៀនបង្រៀន ១០ ដំណាក់កាល)

* **Lesson 1 — Project Architecture**: របៀបរៀបចំ Monorepo/Ecosystem រវាង Backend API, Admin, Storefront, និង Mobile App។
* **Lesson 2 — Database Relationships**: របៀបភ្ជាប់ទំនាក់ទំនង 1-to-1, 1-to-Many, Many-to-Many រវាង Products, Categories, Variants, Inventories និង Sales។
* **Lesson 3 — Authentication & Tokens**: របៀបបង្កើត Login System សុវត្ថិភាពជាមួយ Sanctum Bearer Tokens និង Auto Refresh Token Rotation។
* **Lesson 4 — Role-Based Access Control**: របៀបគ្រប់គ្រងសិទ្ធិបុគ្គលិកតាមតួនាទី (Super Admin vs Branch Cashier)។
* **Lesson 5 — Real-world CRUD**: របៀបបង្កើត Product Management ពី Form ខាងមុខ រហូតដល់ Controller, Service និង Database។
* **Lesson 6 — Robust Media Management**: របៀបគ្រប់គ្រង Storage Link, File Upload, Public Media URLs និង Fallback System ដោយគ្មាន Broken Image។
* **Lesson 7 — POS Transaction Engine**: របៀបសរសេរ Transaction គិតលុយ និងកាត់ស្តុកស្វ័យប្រវត្តិក្នងពេលតែមួយ។
* **Lesson 8 — Multi-Warehouse Inventory**: របៀបតាមដានចលនាស្តុក (Stock In/Out/Transfer/Audit) តាមសាខានីមួយៗ។
* **Lesson 9 — Modern Frontend Engineering**: របៀបប្រើ React 19, TypeScript, Custom Hooks, Zustand, និង TanStack Query Caching។
* **Lesson 10 — Debugging & Troubleshooting**: របៀបអាន Error Stack Trace, ដោះស្រាយបញ្ហា CORS/Mixed-Content, និងដោះស្រាយបញ្ហា Deployment លើ Vercel/Render។

---

# PART 15 — TEACHING FEATURE MASTERCLASS: PRODUCT MANAGEMENT

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE MASTERCLASS: Product & Catalog Management System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Business Problem:
   ហាងត្រូវការគ្រប់គ្រងទំនិញដែលមានលក្ខណៈខុសៗគ្នា (ទំនិញទោល Single Product, ទំនិញមានជម្រើស Variants ដូចជា Size/Color,
   ទំនិញមាន Barcode/SKU, និងទំនិញមានការតាមដានលេខស៊េរី IMEI/Batch)។

2. Concept:
   ប្រើប្រាស់ Master-Detail Pattern ដែល Table `products` ផ្ទុកព័ត៌មានទូទៅ ហើយ `product_variants` ផ្ទុក SKU, តម្លៃ និងស្តុកជាក់ស្តែង។

3. Backend Layer:
   - Controller: `app/Http/Controllers/Api/V1/Product/ProductController.php`
   - Model: `app/Models/Product/Product.php`
   - Form Request: `app/Http/Requests/Product/StoreProductRequest.php`
   - Resource: `app/Http/Resources/Product/ProductResource.php` (Using FormatsMediaUrl trait)

4. Frontend Layer:
   - Page: `admin-dashboard/src/pages/products/ProductsPage.tsx`
   - Form: `admin-dashboard/src/pages/products/ProductFormPage.tsx`
   - Components: `ProductThumbnail.tsx`, `ProductTableSection.tsx`, `ProductMediaSection.tsx`

5. Request-Response Flow:
   User Input ──► React Hook Form ──► POST /api/v1/products ──► StoreProductRequest Validation
   ──► ProductService::create() ──► DB Insert (products, variants, images) ──► Return ProductResource ──► UI Invalidate & Refresh

6. Common Mistakes to Avoid:
   - កុំ Hardcode URL http://localhost/ ក្នុង Frontend Image Tag។
   - កុំភ្លេច Wrap ការ Save Variant និង Image ក្នុង DB::transaction()។
   - កុំកាត់បន្ថយទំហំរូបភាពដោយ CSS តែមួយមុខ ត្រូវប្រើ WebP Compression និង Thumbnail Size ពី Server។

7. Practice Exercise for Students:
   ចូរសរសេរ Feature បន្ថែមមួយដែលអនុញ្ញាតឱ្យទាញយក Barcode Label ជា PDF សម្រាប់បិទលើផលិតផលដែលទើបបង្កើតថ្មី។
```

---

# PART 16 — EXPLAIN LIKE A SENIOR ARCHITECT (របៀបពន្យល់កូដបែបវិជ្ជាជីវៈ)

* **WHAT (តើវាជាអ្វី?)**: ប្រព័ន្ធ Enterprise POS & E-Commerce Omnichannel។
* **WHY (ហេតុអ្វីត្រូវរៀបចំ architecture បែបនេះ?)**: ដើម្បីធានាថាទិន្នន័យស្តុក ការលក់ និងហិរញ្ញវត្ថុ មានប្រភពច្បាស់លាស់តែមួយ (Single Source of Truth) មិនច្រឡូកច្រឡំរវាងការលក់តាមហាង និងការលក់តាម Online។
* **HOW (វាដំណើរការយ៉ាងដូចម្តេច?)**: Backend ផ្ដល់ REST API ដែលមានសុវត្ថិភាពខ្ពស់ ហើយ Frontend ទាំង 3 (Admin, Customer, Mobile) គ្រាន់តែជា Client ដែលប្រើប្រាស់ API រួមគ្នា។
* **WHEN (ពេលណាត្រូវប្រើ?)**: សម្រាប់អាជីវកម្មខ្នាតមធ្យម និងធំ ដែលមានសាខាច្រើន និងមានការលក់ចម្រុះបណ្តាញ។
* **WHO (អ្នកណាជាអ្នកទទួលខុសត្រូវ?)**:
  * *Backend Services*: ទទួលខុសត្រូវលើ Data Integrity, Validation, Math Calculation, និង Security។
  * *Frontend Applications*: ទទួលខុសត្រូវលើ User Experience, Speed, Caching, និង Interactive Visuals។

---

# PART 17 — LEVEL-BASED EXPLANATIONS (ការពន្យល់តាម ៣ កម្រិត)

### 🟢 Level 1 — Beginner (សម្រាប់អ្នកចាប់ផ្តើម)
> "ប្រព័ន្ធនេះប្រៀបដូចជាផ្សារទំនើបមួយដែលមានឃ្លាំងកណ្តាល។ អ្នកគិតលុយនៅបញ្ជរប្រើ iPad/កុំព្យូទ័រ (POS) ដើម្បី Scan ទំនិញ ឯភ្ញៀវនៅផ្ទះអាចបញ្ជាទិញតាមទូរស័ព្ទ (Customer Website)។ នៅពេលមានអ្នកទិញទំនិញមួយ ចំនួនទំនិញក្នុងស្តុកនឹងត្រូវកាត់ចេញភ្លាមៗស្វ័យប្រវត្តិ។"

### 🟡 Level 2 — Intermediate (សម្រាប់អ្នកមានមូលដ្ឋាន)
> "គម្រោងនេះអនុវត្តតាម Decoupled Client-Server Architecture។ Backend ប្រើ Laravel 11 ផ្ដល់ Versioned RESTful APIs (`/api/v1/...`)។ Frontend ប្រើ React 19 ជាមួយ TanStack React Query សម្រាប់គ្រប់គ្រង Cache និង Zustand សម្រាប់ Client State។ រាល់ការ Update ទិន្នន័យ ត្រូវឆ្លងកាត់ Form Request Validation, Policy Authorization, និង Database Transactions។"

### 🔴 Level 3 — Advanced / Architect (សម្រាប់កម្រិត Senior)
> "ប្រព័ន្ធនេះត្រូវបានរចនាឡើងជាមួយ Enterprise Multi-Tenancy និង Scalable Domain-Driven Service Layer។ វាប្រើប្រាស់ Optimistic/Pessimistic Locking លើ Inventory Movements, មាន Spatie RBAC គ្រប់គ្រងសិទ្ធិបែប Granular, ប្រើប្រាស់ Sanctum JWT ជាមួយ Refresh Token Rotation, មាន Canonical Media Streamed URL Resolver សម្រាប់ CDN/Edge Deployments, និងគាំទ្រ High-Concurrency Redis Caching លើ Product Catalog។"

---

# PART 18 — REAL CODE EVIDENCE (ភស្តុតាងជាក់ស្តែងក្នុងកូដ)

1. **Media Trait**: `backend/app/Http/Resources/Traits/FormatsMediaUrl.php`
   * Method: `formatMediaUrl(?string $path, ?string $fallback = null): ?string`
2. **Canonical Resolver**: `admin-dashboard/src/utils/image.ts`
   * Function: `export const resolveMediaUrl = (urlOrPath?: any, fallbackType?: MediaFallbackType): string`
3. **POS Sale Service**: `backend/app/Services/POS/PosSaleService.php`
   * Method: `public function createSale(array $data, User $cashier): Sale`
4. **Universal Image Component**: `admin-dashboard/src/components/common/AppImage.tsx`
   * Component: `export const AppImage: React.FC<AppImageProps>`
5. **Mobile Network Client**: `mobile_app/lib/core/network/dio_client.dart`
   * Class: `class DioClient` (with `String.fromEnvironment('API_BASE_URL')`)

---

# PART 19 & 20 — FINAL SYSTEM AUDIT & SUMMARY TABLE

| Feature Module | Status | Backend Layer | Frontend Layer | Database Schema | API Route | Main Implementation Files |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | ✅ COMPLETED | Sanctum + Spatie Permission | Zustand AuthStore + RouteGuards | `users`, `roles`, `permissions` | `/api/v1/auth/*` | `AuthController.php`, `authStore.ts`, `UserResource.php` |
| **Media & Image Storage** | ✅ COMPLETED | `FormatsMediaUrl` Trait | `resolveMediaUrl()` + `<AppImage />` | `product_images`, `companies` | `/api/v1/storage/*` | `FormatsMediaUrl.php`, `image.ts`, `AppImage.tsx` |
| **Product Management** | ✅ COMPLETED | `ProductService` + `ProductResource` | `ProductsPage` + `ProductThumbnail` | `products`, `product_variants` | `/api/v1/products/*` | `ProductController.php`, `ProductsPage.tsx`, `ProductFormPage.tsx` |
| **POS Terminal & Checkout** | ✅ COMPLETED | `PosSaleService` + `CashRegister` | `POSPage` + Quick Grid + KHQR | `sales`, `sale_items`, `cash_registers` | `/api/v1/pos/*` | `PosController.php`, `POSPage.tsx`, `PosSaleService.php` |
| **Inventory & Transfers** | ✅ COMPLETED | `InventoryService` (Ledger Math) | `InventoryPage` + Stock Table | `inventories`, `inventory_movements` | `/api/v1/inventory/*` | `InventoryService.php`, `InventoryPage.tsx` |
| **HR, Shifts & Attendance** | ✅ COMPLETED | `EmployeeService` + Shift Logic | `EmployeesPage` + Shifts Tab | `employees`, `shifts`, `attendances` | `/api/v1/employees/*` | `EmployeeController.php`, `EmployeesPage.tsx` |
| **Customer Storefront** | ✅ COMPLETED | Storefront Public APIs | React 19 Storefront (Cart/Checkout) | `orders`, `order_items`, `coupons` | `/api/v1/storefront/*` | `HomePage.tsx`, `ProductDetailPage.tsx`, `CartPage.tsx` |
| **Mobile POS Terminal** | ✅ COMPLETED | REST API Endpoints | Flutter 3 (CachedNetworkImage) | N/A (Consumes REST API) | `/api/v1/*` | `dio_client.dart`, `app_network_image.dart` |
| **Marketing & CMS** | ✅ COMPLETED | `BannerResource` + `BlogResource` | `BannersPage` + `CMSPage` | `banners`, `blogs`, `promotions` | `/api/v1/marketing/*` | `BannerResource.php`, `BannersPage.tsx` |
| **Multi-Branch Settings** | ✅ COMPLETED | `CompanyService` + `BranchResource` | `SettingsPage` + `CompanyPage` | `companies`, `branches`, `settings` | `/api/v1/settings/*` | `CompanyController.php`, `SettingsPage.tsx` |

---

# PART 21 — CONCLUSION & TEACHING VALUE (សេចក្តីសន្និដ្ឋាន)

គម្រោង **Project-Enterprise-E-Commerce & POS System** នេះ គឺជាគំរូស្ថាបត្យកម្មកម្រិតស្តង់ដារ **Enterprise Production Ready** ដ៏ល្អឥតខ្ចោះសម្រាប់ការសិក្សា និងយកទៅបង្រៀន (Teaching Material) ព្រោះវាបានដោះស្រាយបញ្ហាជាក់ស្តែងក្នុងពិភពពិត (Real-World Problems) រួមមាន៖
1. **Decoupled Omnichannel Architecture**: ការបំបែក Frontend ច្រើន (Web Admin, Storefront, Mobile) ឱ្យប្រើប្រាស់ API រួមមួយ។
2. **Bulletproof Media Storage Strategy**: ការដោះស្រាយបញ្ហារូបភាពខូច/បាត់ តាមរយៈ Canonical HTTPS Serialization និង Multi-Tier Dynamic Fallbacks។
3. **High-Integrity Financial & Inventory Transactions**: ការប្រើប្រាស់ Database Atomic Transactions និង Move-Ledger ធានាថាស្តុកនិងលុយមិនអាចខុសគ្នាឡើយ។
4. **Modern Developer Experience**: ការប្រើប្រាស់ React 19, TypeScript, TanStack Query v5, និង Laravel 11 ផ្ដល់នូវល្បឿន UI យ៉ាងរលូន និងកូដមានរបៀបរៀបរយខ្ពស់។
