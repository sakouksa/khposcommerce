# 📑 KHPosCommerce — Page Access & Action Permission Matrix

## 1. Overview
In accordance with enterprise standards:
- **`[module].view`** acts as the primary **Page Access / Route Guard** permission.
- Action permissions (`.create`, `.update`, `.delete`, `.export`, `.import`, `.approve`, `.refund`) control in-page capabilities (buttons, modals, drawers, API endpoints).
- Scope (`Branch`, `Warehouse`, `Company`, `User Ownership`) enforces multi-tenant boundaries.

---

## 2. Complete Module Page & Action Matrix

| Module | Route | Page Access (`.view`) | Create | Edit | Delete | Export | Import | Special Actions | Data Scope | Allowed Roles |
|---|---|---|---|---|---|---|---|---|---|---|
| **Dashboard** | `/dashboard` | `dashboard.view` | — | — | — | — | — | Live Metrics | Branch / Company | `super_admin`, `admin`, `manager`, `warehouse_staff`, `cashier`, `staff` |
| **POS Terminal** | `/pos` | `pos.access` | `sale.create` | — | — | — | — | `payment.process`, `cash_register.manage` | Branch & Register | `super_admin`, `admin`, `manager`, `cashier` |
| **Products** | `/products` | `product.view` | `product.create` | `product.update` | `product.delete` | `product.export` | `product.import` | `stock_adjustment.adjust` | Company / Branch | `super_admin`, `admin`, `manager` (View/Create/Edit/Export), `warehouse_staff` (View only), `cashier` (View only), `staff` (View only) |
| **Categories** | `/categories` | `category.view` | `category.create` | `category.update` | `category.delete` | `category.export` | `category.import` | — | Company-wide | `super_admin`, `admin`, `manager` |
| **Brands** | `/brands` | `brand.view` | `brand.create` | `brand.update` | `brand.delete` | `brand.export` | `brand.import` | — | Company-wide | `super_admin`, `admin`, `manager` |
| **Units & Taxes** | `/units`, `/taxes` | `unit.view`, `tax.view` | `*.create` | `*.update` | `*.delete` | `*.export` | `*.import` | — | Company-wide | `super_admin`, `admin`, `manager` |
| **Inventory** | `/inventory` | `inventory.view` | `inventory.create` | `inventory.update` | `inventory.delete` | `inventory.export` | — | `inventory.adjust`, `inventory.transfer`, `inventory.opname` | Authorized Warehouse(s) | `super_admin`, `admin`, `manager`, `warehouse_staff` |
| **Stock Adjustments** | `/inventory/adjustments` | `stock_adjustment.view` | `stock_adjustment.create` | `stock_adjustment.update` | `stock_adjustment.delete` | `stock_adjustment.export` | — | `stock_adjustment.adjust` | Authorized Warehouse(s) | `super_admin`, `admin`, `manager`, `warehouse_staff` |
| **Stock Transfers** | `/inventory/transfers` | `stock_transfer.view` | `stock_transfer.create` | `stock_transfer.update` | `stock_transfer.delete` | `stock_transfer.export` | — | `stock_transfer.transfer` | Dual Warehouse Validation | `super_admin`, `admin`, `manager`, `warehouse_staff` |
| **Stock Opnames** | `/inventory/opnames` | `stock_opname.view` | `stock_opname.create` | `stock_opname.update` | `stock_opname.delete` | `stock_opname.export` | — | `stock_opname.opname` | Authorized Warehouse(s) | `super_admin`, `admin`, `manager`, `warehouse_staff` |
| **Sales Orders** | `/sales` | `sale.view` | `sale.create` | `sale.update` | `sale.delete` | `sale.export` | — | `sale.return`, `sale.refund` | Authorized Branch | `super_admin`, `admin`, `manager`, `cashier` (View/Create), `staff` (View/Create) |
| **Customer Orders** | `/orders` | `order.view` | `order.create` | `order.update` | `order.delete` | `order.export` | — | `order.manage`, `order.refund`, `order.return` | Authorized Branch | `super_admin`, `admin`, `manager`, `cashier` |
| **Order Returns** | `/returns` | `sale_return.view` | `sale_return.create` | `sale_return.update` | `sale_return.delete` | — | — | Restock / Refund | Authorized Branch | `super_admin`, `admin`, `manager`, `cashier` |
| **Purchases** | `/purchases` | `purchase.view` | `purchase.create` | `purchase.update` | `purchase.delete` | `purchase.export` | — | `purchase.approve`, `payment.process` | Authorized Branch | `super_admin`, `admin`, `manager`, `warehouse_staff` (View only) |
| **Suppliers** | `/suppliers` | `supplier.view` | `supplier.create` | `supplier.update` | `supplier.delete` | `supplier.export` | `supplier.import` | — | Company / Branch | `super_admin`, `admin`, `manager`, `warehouse_staff` (View only) |
| **Customers** | `/customers` | `customer.view` | `customer.create` | `customer.update` | `customer.delete` | `customer.export` | `customer.import` | Loyalty & Wallet Adjust | Authorized Branch / Company | `super_admin`, `admin`, `manager`, `cashier` (View/Create), `staff` (View/Create) |
| **Employees** | `/employees` | `employee.view` | `employee.create` | `employee.update` | `employee.delete` | `employee.export` | `employee.import` | Attendance, Shifts, Payroll | Authorized Branch | `super_admin`, `admin`, `manager` (View only) |
| **Finance / Expenses**| `/finance` | `expense.view` | `expense.create` | `expense.update` | `expense.delete` | `expense.export` | — | `expense.approve`, `transaction.export` | Authorized Branch | `super_admin`, `admin`, `manager` |
| **Marketing** | `/marketing/*` | `promotion.view`, `coupon.view` | `*.create` | `*.update` | `*.delete` | — | — | Coupon Code Generator | Branch / Channels | `super_admin`, `admin`, `manager` |
| **Reports** | `/reports/*` | `report.view` | — | — | — | `report.export` | — | Sales / Purchase / Inventory / P&L | Authorized Branch Scope | `super_admin`, `admin`, `manager` |
| **Company Structure** | `/company` | `company.view` | `company.create` | `company.update` | `company.delete` | `company.export` | — | Legal Entity Setup | Corporate Scope | `super_admin` only |
| **Branches** | `/branches` | `branch.view` | `branch.create` (`super_admin`) | `branch.update` | `branch.delete` (`super_admin`) | — | — | Branch Location Details | Assigned Branch | `super_admin`, `admin`, `manager` (View only) |
| **Warehouses** | `/warehouses` | `warehouse.view` | `warehouse.create` (`super_admin`) | `warehouse.update` | `warehouse.delete` (`super_admin`) | — | — | Bin & Rack Setup | Assigned Warehouse | `super_admin`, `admin`, `manager`, `warehouse_staff` |
| **Users** | `/users` | `user.view` | `user.create` | `user.update` | `user.delete` (`super_admin`) | `user.export` | — | Assign Role (`super_admin`) | Branch / Corporate | `super_admin`, `admin` (Create/Edit branch staff only) |
| **Roles & Permissions**| `/roles`, `/permissions`| `role.view`, `permission.view` | `*.create` | `*.update` | `*.delete` | `*.export` | — | Permission Assignment | Global System | `super_admin` only |
| **Security & Logs** | `/security`, `/activity-logs` | `activity_log.view` | — | — | `activity_log.delete` | `activity_log.export` | — | Device Audit & Recycle Bin | Global System | `super_admin` only |
| **Settings** | `/settings` | `setting.view` | `setting.create` | `setting.update` | `setting.delete` | — | — | System Configurations | Global System | `super_admin` only |
