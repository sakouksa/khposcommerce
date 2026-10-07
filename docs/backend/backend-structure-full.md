# ⚙️ Full Backend Structure & Technical Blueprint: `backend-khposcommerce/`

> **Reference File in Backend Directory:** [`backend-khposcommerce/STRUCTURE.md`](file:///Users/macbook/Workspace/projects/systems/pos-ecommerce/backend-khposcommerce/STRUCTURE.md)

---

## 1. Executive Summary

The **KHPosCommerce Backend** ([`backend-khposcommerce/`](file:///Users/macbook/Workspace/projects/systems/pos-ecommerce/backend-khposcommerce)) is built on **Laravel 12** with **PostgreSQL 16** and **Redis 7**. It utilizes a **Domain-Driven Layered Architecture (DDD)** with the **Action Pattern** and strict separation of API consumers across:
- **Admin & Back-Office ERP / POS:** `/api/v1/admin/*`
- **Customer E-Commerce Web Storefront:** `/api/v1/customer/*`
- **Mobile POS & Staff Terminal:** `/api/v1/mobile/*`
- **Platform Multi-Tenant SaaS:** `/api/v1/platform/*`
- **Authentication & Security:** `/api/v1/auth/*`
- **Public & Health Checks:** `/api/v1/public/*`

---

## 2. Full Directory & File Tree

```text
backend-khposcommerce/
│
├── app/
│   │
│   ├── Actions/                                # Single Responsibility Business Actions (Atomic Transactions)
│   │   ├── Auth/
│   │   │   ├── LoginAction.php
│   │   │   ├── LogoutAction.php
│   │   │   ├── RefreshTokenAction.php
│   │   │   ├── RegisterAction.php
│   │   │   └── ResetPasswordAction.php
│   │   │
│   │   ├── Company/
│   │   │   ├── CreateCompanyAction.php
│   │   │   └── UpdateCompanyAction.php
│   │   │
│   │   ├── Product/
│   │   │   ├── CreateProductAction.php
│   │   │   ├── UpdateProductAction.php
│   │   │   └── DeleteProductAction.php
│   │   │
│   │   ├── Inventory/
│   │   │   ├── AdjustStockAction.php
│   │   │   ├── TransferStockAction.php
│   │   │   └── ReceiveStockAction.php
│   │   │
│   │   ├── Purchase/
│   │   │   ├── CreatePurchaseAction.php
│   │   │   ├── UpdatePurchaseAction.php
│   │   │   ├── ReceivePurchaseAction.php
│   │   │   └── CancelPurchaseAction.php
│   │   │
│   │   ├── Sales/
│   │   │   ├── CreateSaleAction.php
│   │   │   ├── CancelSaleAction.php
│   │   │   └── RefundSaleAction.php
│   │   │
│   │   ├── POS/
│   │   │   ├── CheckoutAction.php
│   │   │   ├── OpenRegisterAction.php
│   │   │   └── CloseRegisterAction.php
│   │   │
│   │   ├── Order/
│   │   │   ├── CreateOrderAction.php
│   │   │   ├── ConfirmOrderAction.php
│   │   │   ├── CancelOrderAction.php
│   │   │   └── ReturnOrderAction.php
│   │   │
│   │   └── Payment/
│   │       ├── CreatePaymentAction.php
│   │       ├── ConfirmPaymentAction.php
│   │       └── RefundPaymentAction.php
│   │
│   ├── Console/
│   │   └── Commands/
│   │
│   ├── Enums/
│   │   ├── CurrencyCode.php
│   │   ├── OrderStatus.php
│   │   ├── PaymentStatus.php
│   │   ├── PaymentMethod.php
│   │   ├── PurchaseStatus.php
│   │   ├── SaleStatus.php
│   │   ├── InventoryStatus.php
│   │   ├── StockMovementType.php
│   │   ├── UserStatus.php
│   │   └── QuantityUnit.php
│   │
│   ├── Events/
│   │   ├── OrderCreated.php
│   │   ├── SaleCompleted.php
│   │   ├── PaymentCompleted.php
│   │   ├── StockTransferred.php
│   │   └── NotificationCreated.php
│   │
│   ├── Exceptions/
│   │   ├── BusinessException.php
│   │   ├── InsufficientStockException.php
│   │   ├── InvalidPaymentException.php
│   │   ├── TenantAccessException.php
│   │   └── ...
│   │
│   ├── Http/
│   │   │
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           │
│   │   ├── Public/
│   │   │   ├── HealthController.php
│   │   │   ├── ConfigController.php
│   │   │   └── SeoController.php
│   │   │
│   │   ├── Auth/
│   │   │   ├── AuthController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── DeviceController.php
│   │   │   ├── SecurityController.php
│   │   │   ├── RoleController.php
│   │   │   └── PermissionController.php
│   │   │
│   │   ├── Admin/
│   │   │   ├── Company/ (Company, Branch, Warehouse, Store)
│   │   │   ├── Product/ (Product, Category, Brand, Variant, Attribute, Unit, Tax)
│   │   │   ├── Inventory/ (Inventory, StockAdjustment, StockTransfer, StockOpname, StockMovement)
│   │   │   ├── Purchase/ (Purchase, PurchaseReturn, PurchaseReceive)
│   │   │   ├── Supplier/ (Supplier, SupplierContact)
│   │   │   ├── Sales/ (Sale, SaleReturn, Invoice)
│   │   │   ├── POS/ (POS, CashRegister, POSSession)
│   │   │   ├── Order/ (Order, OrderReturn, Shipment)
│   │   │   ├── Payment/ (Payment, PaymentMethod)
│   │   │   ├── Customer/ (Customer, CustomerAddress, CustomerGroup)
│   │   │   ├── Employee/ (Employee, Attendance, Shift, Leave, Payroll)
│   │   │   ├── Expense/ (Expense, ExpenseCategory)
│   │   │   ├── Marketing/ (Promotion, Coupon, Campaign, FlashSale)
│   │   │   ├── Reports/ (Dashboard, SalesReport, InventoryReport, PurchaseReport, FinancialReport)
│   │   │   ├── Settings/ (Setting, Currency, Language)
│   │   │   └── System/ (ActivityLog, AuditLog, LoginHistory)
│   │   │
│   │   ├── Customer/ (Auth, Home, Catalog, Search, Cart, Checkout, Order, Wishlist, Review)
│   │   ├── Mobile/ (Auth, Dashboard, POS, Product, Order, Sync)
│   │   └── Platform/ (Dashboard, Tenant, Company, Plan, Subscription, Billing, User, FeatureFlag, System)
│   │
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Resources/
│   │
│   ├── Jobs/
│   ├── Listeners/
│   ├── Mail/
│   ├── Models/
│   ├── Notifications/
│   ├── Policies/
│   ├── Repositories/
│   ├── Services/
│   ├── Support/
│   └── Traits/
│
├── bootstrap/
├── config/
├── database/
├── lang/
├── routes/
├── storage/
├── tests/
├── docker/
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── Dockerfile
├── phpunit.xml
└── README.md
```

*Consult [`backend-khposcommerce/STRUCTURE.md`](file:///Users/macbook/Workspace/projects/systems/pos-ecommerce/backend-khposcommerce/STRUCTURE.md) for the complete line-by-line documentation.*
