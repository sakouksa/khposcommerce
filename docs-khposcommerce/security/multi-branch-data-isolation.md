# Multi-Branch & Multi-Tenant Data Isolation

## 1. Architecture & Entity Hierarchy

KHPosCommerce enforces a strict 4-level organizational hierarchy:
```
                      COMPANY (Tenant)
                             │
            ┌────────────────┴────────────────┐
         BRANCH A                          BRANCH B
            │                                 │
     WAREHOUSE 1 (WH01)                WAREHOUSE 2 (WH02)
            │                                 │
   Inventory / Sales / POS            Inventory / Sales / POS
```

### Core Hierarchy Principles
1. **Company (Tenant):** The primary boundary. No user may cross company boundaries under any circumstances.
2. **Branch:** An operational business location (store, retail outlet, office).
3. **Warehouse:** A physical storage facility tied to a branch (`warehouses.branch_id`).
4. **User:** Assigned to a company (`users.company_id`) and explicitly assigned to one or more branches via the `user_branches` relationship.

---

## 2. User Branch Assignment Schema

### Migration: `user_branches`
```sql
CREATE TABLE user_branches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_branch (user_id, branch_id)
);
```

### User Model Integration (`App\Models\User`)
- `branches(): BelongsToMany`: Defines relationship to accessible branches.
- `accessibleBranchIds(): array`: Resolves all accessible branch IDs:
  - If `super_admin`: Returns all branches belonging to user's `company_id`.
  - Otherwise: Returns IDs from `user_branches` pivot (and fallback to default `branch_id`).
- `accessibleWarehouseIds(): array`: Returns warehouse IDs belonging to the accessible branches.
- `canAccessBranch(int $branchId): bool`: True if the branch ID is in `accessibleBranchIds()`.
- `canAccessWarehouse(int $warehouseId): bool`: True if the warehouse ID is in `accessibleWarehouseIds()`.
- `getActiveBranchId(?Request $request): ?int`: Resolves active branch from request or default, strictly validating that the user is authorized to access it.

---

## 3. Data Classification Matrix

| Resource | Scope Level | Tenant Field | Branch Field | Authorization Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Product Catalog** | Company | `company_id` | - | Read/write scoped to user's company. |
| **Categories & Brands** | Company | `company_id` | - | Scoped to company. |
| **Customers** | Company | `company_id` | - | Scoped to company CRM. |
| **Suppliers** | Company | `company_id` | - | Scoped to company. |
| **Sales** | Branch | `company_id` | `branch_id` | Read/write strictly restricted to `accessibleBranchIds()`. |
| **Orders** | Branch | `company_id` | `branch_id` / `store.branch_id` | Restricted to authorized branches. |
| **POS Cash Registers** | Branch | `company_id` | `branch_id` | Only accessible by assigned branch cashiers/managers. |
| **Expenses** | Branch | `company_id` | `branch_id` | Scoped to active/authorized branch. |
| **Inventory** | Warehouse | `company_id` | `warehouse.branch_id` | Scoped to `accessibleWarehouseIds()`. |
| **Stock Transfers** | Double Warehouse | `company_id` | Source & Destination | **Critical:** User must have access to BOTH `from_warehouse_id` AND `to_warehouse_id`. |
| **Reports & Dashboards** | Multi-level | `company_id` | `branch_id` | Metrics and aggregations filtered to authorized branches. |

---

## 4. Centralized Access Scoping: `AccessScopeService`

Located at `App\Services\Support\AccessScopeService`:

```php
// Query Scoping
AccessScopeService::scopeCompany($query, $user);
AccessScopeService::scopeBranches($query, $user, 'branch_id');
AccessScopeService::scopeWarehouses($query, $user, 'warehouse_id');

// Authorization & Validation
AccessScopeService::validateBranchAccess($user, $requestedBranchId);
AccessScopeService::validateWarehouseAccess($user, $requestedWarehouseId);
AccessScopeService::resolveActiveBranch($user, $request);
```

### Prevention of Query Parameter Tampering
Queries **NEVER** allow client parameters to expand accessible scope:
```php
// Controller index() pattern
$query = Sale::query()->where('company_id', $user->company_id);

$authorizedBranches = $user->accessibleBranchIds();
$requestedBranch = $request->input('branch_id');

if ($requestedBranch) {
    if (!in_array((int) $requestedBranch, $authorizedBranches, true)) {
        abort(403, 'Unauthorized access to requested branch.');
    }
    $query->where('branch_id', $requestedBranch);
} else {
    $query->whereIn('branch_id', $authorizedBranches);
}
```
Client query parameter `?branch_id=999` will result in an immediate `403 Forbidden` if the user is not assigned to branch 999.
