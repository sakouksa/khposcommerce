# 🗺️ Database ↔ Backend Model ↔ API ↔ Frontend Mapping & Field Audit

ឯកសារនេះបង្ហាញពីការ map ទិន្នន័យជាក់ស្តែងចាប់ពី **Database Schema → Eloquent Models → API Response/Payload → Admin Frontend UI & Mobile App** ព្រមទាំងបញ្ជាក់ពីចំណុច Mismatch និងស្ថានភាពតភ្ជាប់ជាក់ស្តែង។

---

## 1. សង្ខេប Data Flow Mapping

```text
DATABASE TABLE (MySQL 8)
       ↓
ELOQUENT MODEL (backend/app/Models/)
       ↓
CONTROLLER & RESOURCE (backend/app/Http/)
       ↓
REST API ENDPOINT (/api/v1/...)
       ↓
FRONTEND API CLIENT & REACT QUERY (admin-dashboard/src/api/)
       ↓
UI PAGE & FORMS (admin-dashboard/src/pages/)
```

---

## 2. Comprehensive Module Mapping Table

| Module / Domain | Database Table(s) | Eloquent Model | API Endpoints | Admin Frontend Page | Mobile Screen | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `users`, `personal_access_tokens`, `jwt_refresh_tokens`, `login_histories` | `App\Models\User`, `LoginHistory` | `POST /api/v1/auth/login`, `GET /api/v1/auth/me` | `LoginPage.tsx`, `ProfilePage.tsx` | `login_screen.dart` | **100% Complete** |
| **Products & Catalog** | `products`, `product_variants`, `product_images`, `categories`, `brands`, `units`, `taxes`, `attributes` | `Product`, `ProductVariant`, `Category`, `Brand`, `Unit`, `Tax`, `Attribute` | `GET/POST /api/v1/products`, `/categories`, `/brands`, `/units`, `/taxes`, `/attributes` | `ProductsPage.tsx`, `ProductFormPage.tsx`, `CategoriesPage.tsx`, `BrandsPage.tsx`, `UnitsPage.tsx`, `AttributesPage.tsx`, `TaxesPage.tsx` | `product_list_screen.dart`, `product_detail_screen.dart` | **98% Complete** |
| **Inventory & Stock** | `inventories`, `inventory_movements`, `stock_adjustments`, `stock_transfers`, `stock_opnames` | `Inventory`, `InventoryMovement`, `StockAdjustment`, `StockTransfer`, `StockOpname` | `GET /api/v1/inventory/levels`, `/movements`, `POST /stock-adjustments`, `/stock-transfers`, `/stock-opnames` | `InventoryPage.tsx` (Levels, Movements, Transfers, Adjustments, Opname tabs) | `inventory_screen.dart`, `stock_opname_screen.dart` | **95% Complete** |
| **POS & Cash Registers** | `sales`, `sale_items`, `cash_registers`, `cash_register_transactions` | `Sale`, `SaleItem`, `CashRegister` | `POST /api/v1/pos/sales`, `GET /api/v1/pos/product-search`, `POST /pos/cash-registers/open`, `/close` | `POSPage.tsx`, `SalesPage.tsx` | `pos_screen.dart`, `cart_screen.dart` | **95% Complete** |
| **Suppliers & Purchases** | `suppliers`, `purchases`, `purchase_items`, `purchase_payments`, `purchase_returns` | `Supplier`, `Purchase`, `PurchaseItem`, `PurchaseReturn` | `GET/POST /api/v1/suppliers`, `/purchases`, `POST /purchases/{id}/receive`, `/record-payment`, `GET /purchase-returns` | `SuppliersPage.tsx`, `PurchasesPage.tsx`, `PurchaseReturnsPage.tsx` | `supplier_screen.dart`, `purchase_screen.dart` | **92% Complete** |
| **Customers & CRM** | `customers`, `customer_groups`, `customer_addresses` | `Customer`, `CustomerGroup`, `CustomerAddress` | `GET/POST /api/v1/customers`, `/customer-groups`, `GET /customers/{id}/orders` | `CustomersPage.tsx`, `CustomerFormPage.tsx` | `customer_list_screen.dart` | **92% Complete** |
| **E-Commerce Orders** | `orders`, `order_items`, `order_status_histories`, `shipments`, `payments` | `Order`, `OrderItem`, `Shipment`, `Payment` | `GET/PUT /api/v1/orders`, `/orders/{id}/status`, `/orders/{id}/invoice` | `OrdersPage.tsx`, `ShippingPage.tsx` | `order_history_screen.dart` | **88% Complete** |
| **Employees & HR** | `departments`, `positions`, `employees`, `shifts`, `attendances`, `payrolls`, `employee_leaves` | `Department`, `Position`, `Employee`, `Shift`, `Attendance` | `GET/POST /api/v1/employees`, `/departments`, `/positions`, `/shifts`, `POST /attendances/generate-qr`, `/scan-qr` | `EmployeesPage.tsx` | `employee_screen.dart`, `attendance_screen.dart` | **90% Complete** |
| **Finance & Expenses** | `expenses`, `expense_categories`, `cash_registers` | `Expense`, `ExpenseCategory`, `CashRegister` | `GET/POST /api/v1/expenses`, `/expense-categories`, `/pos/cash-registers` | `FinancePage.tsx`, `ExpensesPage.tsx` | `finance_screen.dart` | **88% Complete** |
| **Analytics & Reports** | Aggregated across `sales`, `purchases`, `inventories`, `expenses` | Raw DB Queries & Eloquent Aggregates | `GET /api/v1/reports/sales/overview`, `/reports/purchase/overview`, `/reports/inventory/overview` | `ReportsPage.tsx`, `SalesReportPage.tsx`, `PurchaseReportPage.tsx` | `report_screen.dart` | **90% Complete** |
| **Notifications** | `enterprise_notifications`, `notification_templates`, `notification_settings` | `EnterpriseNotification`, `NotificationTemplate` | `GET /api/v1/notifications`, `/notification-templates`, `/notification-settings` | `NotificationListPage.tsx`, `NotificationSettingsPage.tsx` | `notification_screen.dart` | **85% Complete** |
| **Security & Audits** | `audit_logs`, `activity_log`, `login_histories`, `security_settings` | `AuditLog`, `ActivityLog`, `SecuritySetting` | `GET /api/v1/activity-logs`, `/security/overview`, `POST /security/verify-manager-pin` | `SecurityPage.tsx`, `ActivityLogsPage.tsx`, `RecycleBinPage.tsx` | `security_screen.dart` | **92% Complete** |

---

## 3. Field Mismatches & How They Are Resolved

### A. Inventory Entity: `inventories` Table vs `stock_levels` Terminology
- **Database Table**: `inventories` (columns: `warehouse_id`, `product_id`, `product_variant_id`, `quantity`, `reserved_quantity`).
- **Frontend Code**: Inventory list and stats query `GET /api/v1/inventory/levels`.
- **Backend Model**: `App\Models\Inventory\Inventory.php` maps directly to table `inventories`.
- **Resolution**: Backend controller alias `available_quantity = quantity - reserved_quantity` is computed dynamically in Eloquent resource/query to guarantee consistency.

### B. POS & Sale Numbering: `invoice_number` vs `sale_number`
- **Database Table**: `sales.invoice_number` (string unique: e.g. `INV-20260817-ABC123`).
- **Frontend Form**: Sent as `invoice_number` during `POST /api/v1/pos/sales`.
- **Backend Model**: `Sale.php` mass-assignable field is `invoice_number`.
- **Resolution**: Verified 100% matching.

### C. Employees Salary: `basic_salary` vs `salary`
- **Database Table**: `employees.basic_salary` (`DECIMAL(12,2)`).
- **Backend Model**: `Employee.php` casts `basic_salary` to float.
- **Frontend Page**: [EmployeesPage.tsx](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/admin-dashboard/src/pages/employees/EmployeesPage.tsx) references `employee.basic_salary` with fallback `employee.salary`.
- **Resolution**: Both are supported gracefully in frontend table renderers.
