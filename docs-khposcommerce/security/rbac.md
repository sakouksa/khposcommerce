# Role-Based Access Control (RBAC) Architecture

## 1. Overview
KHPosCommerce utilizes **Spatie Laravel Permission** configured under the `api` guard for stateless JWT API authorization, coupled with strict organization and multi-branch data isolation.

In KHPosCommerce, the fundamental security principle is:
```
PERMISSION + SCOPE + POLICY = AUTHORIZED ACTION
```
- **Permission:** Determines **WHAT** action the user is permitted to perform (e.g., `sale.view`, `sale.create`, `inventory.update`).
- **Scope:** Determines **WHERE** the user may perform that action (Company, Branch, and Warehouse).
- **Policy:** Evaluates **WHETHER** that specific user can act on that specific model record.

Having a permission (such as `sale.view`) **NEVER** grants access to records belonging to other branches or companies.

---

## 2. Roles & Permissions Hierarchy

### Role Definitions

| Role | Operational Scope | Description & Capabilities |
| :--- | :--- | :--- |
| **`super_admin`** | Company-Wide | System owner / top administrator. Has company-wide authority across all branches. Cannot cross company boundaries. |
| **`admin`** | Scoped Assigned Branches | Operational administrator. Must have explicit branch assignments in `user_branches` unless elevated. |
| **`manager`** | Assigned Branch(es) | Branch manager. Manages sales, expenses, cash registers, and orders strictly within assigned branches. |
| **`cashier`** | Assigned Branch | POS operator. Operates POS cash registers and registers sales strictly in active assigned branch. |
| **`warehouse_staff`** | Assigned Warehouse(s) | Inventory operator. Manages stock balances, receiving, adjustments, and opname for assigned warehouses only. |
| **`staff`** | Assigned Branch | General branch employee with constrained operational view/create rights. |
| **`accountant`** | Company / Assigned Branches | Financial auditor. Views financial reports and expenses within authorized company/branch scopes. |

### Important Security Rule: No Unchecked Admin Bypass
- `admin` does not automatically bypass branch boundaries for operational resources (Sales, Purchases, Inventory, Expenses, POS Registers, Orders).
- `super_admin` only bypasses raw permission strings at the `Gate::before` callback. Model-specific policies (`SalePolicy`, `OrderPolicy`, `ExpensePolicy`, `InventoryPolicy`, etc.) still execute to enforce multi-tenancy and data isolation.

---

## 3. Spatie Permission Configuration

- **Default Guard:** `api`
- **Tables:**
  - `roles`: System roles (`super_admin`, `admin`, `manager`, `cashier`, `warehouse_staff`, `staff`)
  - `permissions`: Granular action slugs (e.g., `sale.view`, `purchase.create`, `customer.delete`)
  - `model_has_roles`: Maps `App\Models\User` to roles
  - `role_has_permissions`: Maps roles to permissions
  - `model_has_permissions`: Direct user permission overrides (if needed)

### Permission Slugs Standard

| Resource | View | Create | Update | Delete | Special Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sales / POS** | `sale.view` | `sale.create` | `sale.update` | `sale.delete` | `pos.register.open`, `pos.register.close` |
| **Orders** | `order.view` | `order.create` | `order.update` | `order.delete` | `order.refund`, `order.tracking` |
| **Inventory** | `inventory.view` | `inventory.create` | `inventory.update` | `inventory.adjust` | `inventory.transfer`, `inventory.opname` |
| **Purchases** | `purchase.view` | `purchase.create` | `purchase.update` | `purchase.delete` | `purchase.receive`, `purchase.return` |
| **Expenses** | `expense.view` | `expense.create` | `expense.update` | `expense.delete` | `expense.approve` |
| **Customers** | `customer.view` | `customer.create` | `customer.update` | `customer.delete` | `customer.export`, `customer.import` |
| **Suppliers** | `supplier.view` | `supplier.create` | `supplier.update` | `supplier.delete` | `supplier.export` |
| **Employees** | `employee.view` | `employee.create` | `employee.update` | `employee.delete` | `payroll.view`, `attendance.view` |
| **Reports** | `report.sales` | - | - | - | `report.purchase`, `report.inventory` |

---

## 4. Policy Integration in `AppServiceProvider`

All policies are registered and mapped explicitly in `App\Providers\AppServiceProvider`:

```php
Gate::policy(Sale::class, SalePolicy::class);
Gate::policy(Purchase::class, PurchasePolicy::class);
Gate::policy(Inventory::class, InventoryPolicy::class);
Gate::policy(StockTransfer::class, StockTransferPolicy::class);
Gate::policy(Expense::class, ExpensePolicy::class);
Gate::policy(Order::class, OrderPolicy::class);
Gate::policy(Customer::class, CustomerPolicy::class);
Gate::policy(Supplier::class, SupplierPolicy::class);
Gate::policy(Product::class, ProductPolicy::class);
Gate::policy(Branch::class, BranchPolicy::class);
Gate::policy(Warehouse::class, WarehousePolicy::class);
Gate::policy(CashRegister::class, CashRegisterPolicy::class);
```

### Gate Callback Rule
```php
Gate::before(function ($user, $ability, $arguments = []) {
    // Only bypass if this is a raw permission string check (no model instance supplied)
    if ($user->hasRole('super_admin') && empty($arguments)) {
        return true;
    }
    // Return null to allow model policies to execute for record-level authorization
    return null;
});
```
This guarantees that even a `super_admin` request evaluating a record will trigger policy checks verifying that company boundaries are respected.
