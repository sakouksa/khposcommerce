# Backend Folder Structure & Organization

```
backend-khposcommerce/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── BaseApiController.php
│   │   │       ├── HealthController.php
│   │   │       ├── SeoController.php
│   │   │       └── V1/
│   │   │           ├── Auth/                 # Authentication, JWT Tokens, Profiles, Roles, Security
│   │   │           │   ├── AuthController.php
│   │   │           │   ├── ProfileController.php
│   │   │           │   ├── DeviceController.php
│   │   │           │   ├── SecurityController.php
│   │   │           │   ├── UserController.php
│   │   │           │   ├── UserRoleController.php
│   │   │           │   ├── RoleController.php
│   │   │           │   └── PermissionController.php
│   │   │           │
│   │   │           ├── Admin/                # Admin ERP & Back-Office Controllers
│   │   │           │   ├── Product/          # Product, Category, Brand, Unit, Tax, Barcode
│   │   │           │   ├── Inventory/        # Inventory, Warehouse, Transfer, StockAlert, Adjustment
│   │   │           │   ├── Purchase/         # PurchaseOrder, PurchaseReturn, Supplier
│   │   │           │   ├── Sales/            # Sale, Invoice, Quotation, CustomerGroup
│   │   │           │   ├── POS/              # POS Sessions, Cash Register, QuickSale
│   │   │           │   ├── Order/            # Order, OrderTracking, OrderItem (Back-office ERP)
│   │   │           │   ├── Customer/         # Customer Management, Address, Loyalty
│   │   │           │   ├── Employee/         # Staff, Department, Shift, Payroll, Attendance
│   │   │           │   ├── Expense/          # Expense, ExpenseCategory
│   │   │           │   ├── Payment/          # PaymentMethod, Transaction, GatewayConfig
│   │   │           │   ├── Report/           # Reports (Sales, Inventory, Purchase, Financial)
│   │   │           │   ├── Setting/          # SystemSettings, BusinessConfig, AppLocalization
│   │   │           │   ├── Company/          # Company, Branch, Store
│   │   │           │   ├── CMS/              # Page, Banner, BlogPost, FAQ, Testimonial
│   │   │           │   ├── Marketing/        # Coupon, Campaign, FlashSale, Discount
│   │   │           │   ├── Notification/     # Notification, NotificationTemplate
│   │   │           │   ├── Shipping/         # ShippingZone, ShippingMethod, Courier
│   │   │           │   ├── Review/           # ProductReview Moderation
│   │   │           │   └── Log/              # ActivityLog, AuditTrail
│   │   │           │
│   │   │           └── Customer/             # Customer E-Commerce Storefront Controllers
│   │   │               ├── StorefrontController.php      # Homepage, Flash Deals, Featured
│   │   │               ├── CatalogController.php         # Public Products, Categories, Brands
│   │   │               ├── CartController.php            # Cart Show, Add, Update, Remove, Checkout
│   │   │               ├── WishlistController.php        # Customer Wishlist CRUD & Move-to-cart
│   │   │               ├── CustomerOrderController.php   # My Orders, Order Tracking by Number
│   │   │               ├── ReviewController.php          # Customer Review Submission
│   │   │               ├── CustomerAuthController.php    # Customer Sign-in/Registration
│   │   │               └── SearchController.php          # Public Search & Autocomplete
│   │   │
│   │   ├── Requests/{Domain}/                # Form Request Validation Rules
│   │   ├── Resources/{Domain}/               # JSON API Response Transformers
│   │   └── Middleware/                       # Auth Guards, Language, Role Permissions
│   │
│   ├── Services/{Domain}/                    # Unified Business Logic & Calculations
│   │   ├── Inventory/InventoryService.php    # Stock adjustments, locking, & availability
│   │   ├── Sales/PricingService.php          # Subtotals, line-item taxes, coupon validations
│   │   ├── Sales/SaleService.php             # POS & Sales invoice recording, stock deduction
│   │   ├── Order/OrderService.php            # Order lifecycle & state transitions
│   │   ├── Product/ProductService.php        # Product CRUD, variant generation, media
│   │   ├── Purchase/PurchaseService.php      # Purchase orders, receiving, supplier stock
│   │   └── [Domain]/...                      # Auth, CMS, Customer, Employee, Expense, etc.
│   │
│   ├── Repositories/{Domain}/                # Unified Database Repositories
│   │   ├── BaseRepository.php                # Generic Eloquent CRUD, Pagination, Soft-Deletes
│   │   └── [Domain]/[Model]Repository.php    # Query abstractions for all 60+ models
│   │
│   ├── Models/{Domain}/                      # Eloquent ORM Persistence Models
│   ├── Policies/{Domain}/                    # Authorization policies (Spatie Permissions)
│   ├── Jobs/                                 # Asynchronous Background Jobs
│   ├── Events/ & Listeners/                  # Domain Events & Event Handlers
│   ├── Notifications/                        # Mail, SMS, In-App Notifications
│   └── Traits/                               # Reusable Model & Controller Traits
│
├── routes/
│   ├── api.php                               # Master Route Loader
│   └── api/
│       └── v1/
│           ├── auth.php                      # Authentication, Tokens, Profile endpoints
│           ├── admin.php                     # Admin ERP & Back-Office endpoints
│           ├── customer.php                  # Customer Storefront & E-Commerce endpoints
│           ├── mobile.php                    # Flutter Mobile POS & Staff endpoints
│           └── public.php                    # Public unauthenticated endpoints & health
│
├── config/                                   # Application Configurations
├── database/
│   ├── migrations/                           # PostgreSQL Schema Definitions
│   ├── seeders/                              # Database Seeders & Demo Data
│   └── factories/                            # Eloquent Model Factories
└── tests/
    ├── Feature/Api/                          # Feature & Integration API Tests
    └── Unit/                                 # Unit Tests for Services and Calculations
```
