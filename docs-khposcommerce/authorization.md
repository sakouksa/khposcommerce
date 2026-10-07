# 🛡️ Authorization & Role-Based Access Control (RBAC)

## 1. RBAC Model & Architecture

Authorization is structured with **Spatie Laravel-Permission** powering roles, permissions, model associations, and route middleware.

```text
User ──(has Many)──> Roles ──(has Many)──> Permissions
  │                                                ▲
  └──────────────(can have Direct)─────────────────┘
```

---

## 2. Standard Roles & Permission Matrix

| Module | Super Admin | Store Manager | Cashier | Inventory Officer | Accountant |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Catalog (Products, Categories)** | Full CRUD | Full CRUD | View Only | View / Edit | View Only |
| **Inventory (Transfers, Adjustments)** | Full CRUD | Full CRUD | View Only | Full CRUD | View Only |
| **POS Register & Checkout** | Full Access | Full Access | Full Access | No Access | View Sales |
| **Void Sale / Manager Override** | Yes | Yes (with PIN) | No | No | No |
| **Suppliers & Purchases** | Full CRUD | Full CRUD | No Access | Create / Receive | View / Pay |
| **Customers & CRM** | Full CRUD | Full CRUD | Create / View | View Only | View Only |
| **Employees & Attendance** | Full CRUD | View / Approve | No Access | No Access | Payroll View |
| **Financial & Profit Reports** | Full Access | Branch Access | No Access | Valuation Only | Full Access |
| **System Settings & Roles** | Full Access | No Access | No Access | No Access | No Access |

---

## 3. Enforcement Layers

1. **Backend Middleware & Form Requests**:
   - Routes are protected via `permission:<permission_name>` or policy methods (`$this->authorize('update', $product)`).
   - If unauthorized, backend immediately rejects request with HTTP `403 Forbidden`.
2. **Frontend UI Permission Guards**:
   - `useAuth()` hook provides `can(permissionName: string): boolean`.
   - Action buttons (Delete, Edit, Adjust, Void) are conditionally hidden or disabled in UI based on user permissions.
