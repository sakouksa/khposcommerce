# 🧪 KHPosCommerce — Security Test Matrix & Verification Report

## 1. Automated Security Test Results
KHPosCommerce contains a dedicated automated security test suite under `tests/Feature/Security/`:

```
PASS  Tests\Feature\Security\MultiBranchDataIsolationTest
  ✓ user in branch a cannot view sale belonging to branch b
  ✓ user in branch a cannot delete sale belonging to branch b
  ✓ sales index is strictly scoped to user authorized branch
  ✓ query filter cannot expand sales access to unauthorized branch
  ✓ user in branch a cannot view order invoice or tracking of branch b
  ✓ user in branch a cannot view expense belonging to branch b
  ✓ user cannot create expense in unauthorized branch
  ✓ branches endpoint only lists branches assigned to user
  ✓ stock transfer fails when destination warehouse is unauthorized
  ✓ user in branch a cannot view purchase of branch b
  ✓ user in branch a cannot view inventory of warehouse b
  ✓ user in branch a cannot view or close cash register of branch b

PASS  Tests\Feature\Security\RbacAuthorizationTest
  ✓ branch admin cannot access company management
  ✓ branch admin cannot access global settings
  ✓ branch admin cannot access roles and permissions
  ✓ super admin can access company management
  ✓ cashier cannot access purchasing
  ✓ cashier cannot delete products
  ✓ warehouse staff cannot create sales
  ✓ customer cannot access admin dashboard or sales
  ✓ branch admin can access allowed operational modules

TOTAL SECURITY TESTS: 21 PASSED (34 assertions, 100% green)
```

---

## 2. Attack Vector Verification & Defense Matrix

| Attack Vector | Simulated Scenario | Defensive Mechanism | Test Status |
|---|---|---|---|
| **Direct Unauthorized URL** | Cashier navigates to `/users` or `/settings` | React `ProtectedRoute` intercepts navigation and renders `<AccessDeniedPage />` | ✅ PASS |
| **Direct API Tampering** | Cashier sends `DELETE /api/v1/admin/products/1` | Spatie `permission:product.delete` middleware returns HTTP `403 Forbidden` | ✅ PASS |
| **IDOR (Cross-Branch View)** | Branch A manager requests `GET /api/v1/admin/sales/{id_in_branch_b}` | `whereIn('branch_id', $user->accessibleBranchIds())` query scope blocks access | ✅ PASS |
| **IDOR (Cross-Branch Delete)**| Branch A manager requests `DELETE /api/v1/admin/sales/{id_in_branch_b}` | AccessScopeService blocks non-authorized branch IDs | ✅ PASS |
| **Parameter Tampering** | Attacker appends `?branch_id=2` to view Branch B sales | Controller overrides query param with authorized branch scope | ✅ PASS |
| **Cross-Warehouse Transfer** | Attacker initiates transfer to unauthorized warehouse | `StockTransferController` checks access for both source and destination warehouses | ✅ PASS |
| **Privilege Escalation** | Branch Admin tries to assign `super_admin` role to own account | `/users/{id}/assign-role` is guarded by `role.update`, excluded from Branch Admin | ✅ PASS |
| **System Settings Breach** | Branch Admin tries to access `/api/v1/admin/settings` | Guarded by `setting.view`, excluded from Branch Admin (403 Forbidden) | ✅ PASS |
| **Corporate Legal Tampering**| Branch Admin tries to update company legal record | Guarded by `company.view / company.update`, excluded from Branch Admin (403 Forbidden) | ✅ PASS |
| **Storefront Customer Bypass**| Customer sends request to `/api/v1/admin/dashboard/stats` | Token has no admin permissions; blocked with HTTP `403 Forbidden` | ✅ PASS |
