# 🛡️ KHPosCommerce — Standard RBAC Permission Specification

## 1. Core Authorization Architectural Formula
KHPosCommerce strictly decouples identity, capabilities, geographical scope, and record ownership:

```
                ROLE (Who is the user?)
                  ↓
             PERMISSION (What can they do?)
                  ↓
        ┌─────────┴─────────┐
        ↓                   ↓
   PAGE ACCESS          ACTION ACCESS
     .view            .create / .update / .delete / .export / .import / .approve
        ↓                   ↓
        └─────────┬─────────┘
                  ↓
                SCOPE (Where can they do it?)
        Company / Branch / Warehouse / POS Register
                  ↓
                POLICY (Which record can they touch?)
          Specific Record ID & Ownership Validation
                  ↓
             FINAL BACKEND API ENFORCEMENT
```

---

## 2. Standard Role Hierarchy & Capability Matrix

| Role | Total Perms | Data Scope | Key Capabilities | Strictly Excluded (Security Boundary) |
|---|---|---|---|---|
| **`super_admin`** | **406 / 406** | Global System / All Companies | Full root administration, legal entity, system settings, RBAC management, global reports, audit logs, CMS | None (Full system owner) |
| **`admin`** *(Branch Admin)* | **328 / 406** | Assigned Branch & Warehouses | Complete branch operational management: Products, Inventory, Sales, Orders, Purchases, Expenses, Branch Staff HRM, Branch Reports, Branch & Store details | ❌ `company.*`<br>❌ `setting.*`<br>❌ `role.*`<br>❌ `permission.*`<br>❌ `activity_log.*`<br>❌ `audit_log.*`<br>❌ `cms.*`, `blog.*`<br>❌ `branch.create / delete`<br>❌ `warehouse.create / delete`<br>❌ `user.delete` |
| **`manager`** *(Branch Manager)* | **121 / 406** | Assigned Branch & Warehouses | Floor management, purchase approvals, sales refunds/returns, cash registers, employee attendance/shifts, branch reports | ❌ All system settings<br>❌ Role/permission management<br>❌ User management<br>❌ Product deletion |
| **`warehouse_staff`** | **27 / 406** | Assigned Warehouse(s) | Stock adjustments, stock transfers, stock opname counts, inventory movements, receiving purchase orders | ❌ POS / Sales<br>❌ Finance / Expenses<br>❌ Employee management<br>❌ Settings / Users |
| **`cashier`** | **21 / 406** | Assigned Branch & Cash Register | POS terminal operation, order creation, payment collection, return requests, customer lookup, cash drawer sessions | ❌ Inventory adjustments<br>❌ Purchasing / Suppliers<br>❌ Financial management<br>❌ Settings / Master data editing |
| **`staff`** *(Branch Assistant)* | **13 / 406** | Assigned Branch | Product & catalog viewing, stock level lookup, sale creation, customer creation, own attendance | ❌ Refunds / Approvals<br>❌ Stock adjustments<br>❌ Expense viewing |
| **`customer`** | **12 / 406** | User Ownership (`user_id`) | E-commerce cart, wishlist, shipping addresses, product review submission | ❌ All Admin Endpoints (`/api/v1/admin/*`) |

---

## 3. High-Risk Permissions & Privilege Escalation Defenses
1. **No Self-Privilege Escalation:**
   - Role assignment endpoint `/api/v1/admin/users/{id}/assign-role` is guarded by `role.update` (reserved for `super_admin`).
   - `admin` (Branch Admin) cannot assign roles to themselves or others.
2. **No Company Legal Entity Tampering:**
   - `company.view`, `company.create`, `company.update`, `company.delete` are strictly reserved for `super_admin`.
   - Branch Admin cannot view corporate tax numbers, central banking credentials, or group holding configurations.
3. **No Audit Log Cleansing:**
   - `activity_log.*` and `audit_log.*` are inaccessible to branch users, ensuring tamper-proof compliance logs.
