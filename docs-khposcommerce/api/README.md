# 🌐 759 REST APIs Master Index & Specification

## 1. Overview
The OptaPOS backend exposes **759 RESTful API endpoints** versioned under `/api/v1/`. All endpoints adhere to JSON:API standards, return standardized JSON envelopes, and enforce Spatie RBAC permissions.

---

## 2. Standard API Response Envelopes

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": {
    "current_page": 1,
    "last_page": 12,
    "per_page": 15,
    "total": 178
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `422 Unprocessable Entity`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "selling_price": ["The selling price must be greater than 0."]
  },
  "code": 422
}
```

---

## 3. API Module Groups

| Domain Group | Base URI | Controllers Involved | Key Permissions |
|---|---|---|---|
| 🔐 **Auth & User** | `/api/v1/auth` | `AuthController`, `ProfileController` | `auth.login`, `profile.update` |
| 📦 **Products & Catalog** | `/api/v1/products` | `ProductController`, `CategoryController`, `BrandController` | `products.view`, `products.create`, `products.edit` |
| 🏭 **Inventory & Stock** | `/api/v1/inventory` | `InventoryController`, `StockTransferController` | `inventory.view`, `inventory.adjust` |
| 🛒 **POS & Checkout** | `/api/v1/pos` | `POSController`, `POSShiftController` | `pos.terminal.access`, `pos.sale.create` |
| 💳 **Bakong KHQR** | `/api/v1/payments` | `BakongController`, `PaymentController` | `pos.payment.process` |
| 🚚 **Purchases** | `/api/v1/purchases` | `PurchaseController`, `SupplierController` | `purchases.create`, `purchases.receive` |
| 👥 **Workforce & HR** | `/api/v1/employees` | `EmployeeController`, `AttendanceController`, `PayrollController` | `employees.view`, `payroll.generate` |
| 📊 **Reports & BI** | `/api/v1/reports` | `SalesReportController`, `InventoryReportController` | `reports.sales.view`, `reports.export` |
| 🛍️ **Public Storefront** | `/api/v1/store` | `StoreController`, `CustomerCartController` | Public / Customer Token |

---
*Related Docs:*
- [Backend Application Architecture](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/applications/backend/README.md)
- [Spatie RBAC Permissions](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/security/spatie-rbac-and-permissions.md)
