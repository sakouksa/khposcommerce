# Complete Authorization Flow & Lifecycle

## 1. The 7-Step Authorization Pipeline

Every API request targeting protected business resources progresses through this mandatory pipeline:

```
[ Client Request ]
       │
       ▼
 1. AUTHENTICATION (Bearer JWT)
    - Validates JWT signature and expiry
    - Resolves User instance ($request->user())
       │
       ▼
 2. RBAC PERMISSION CHECK (Route Middleware)
    - Checks Spatie permission (e.g. permission:sale.view)
    - Fails with 403 Forbidden if user lacks capability
       │
       ▼
 3. ACTIVE SCOPE RESOLUTION
    - Determines authorized company_id
    - Resolves user's accessible branch IDs ($user->accessibleBranchIds())
    - Resolves user's accessible warehouse IDs ($user->accessibleWarehouseIds())
       │
       ▼
 4. PARAMETER TAMPERING DEFENSE
    - If client provides ?branch_id= or body branch_id:
    - Verifies $user->canAccessBranch($branchId)
    - Throws 403 Forbidden if outside authorized scope
       │
       ▼
 5. RECORD-LEVEL POLICY CHECK (IDOR Prevention)
    - Calls $this->authorize('action', $modelInstance)
    - Policy checks:
        a) Model company_id matches User company_id
        b) Model branch_id is in User's accessible branches
        c) Warehouse / ownership rules satisfied
       │
       ▼
 6. SCOPED DATABASE QUERY EXECUTION
    - Scopes SELECT / UPDATE / DELETE / AGGREGATE queries
    - whereIn('branch_id', $authorizedBranches)
       │
       ▼
 7. AUDIT LOGGING & RESPONSE
    - Records audit log with tenant and branch context
    - Returns sanitized API response
```

---

## 2. Horizontal Privilege Escalation (IDOR) Mitigation

### Threat Scenario
A cashier assigned to Branch A attempts to read or mutate a sale belonging to Branch B:
```http
GET /api/v1/sales/987 HTTP/1.1
Authorization: Bearer <token_for_branch_a_cashier>
```

### Defense Implementation
In `SaleController.php`:
```php
public function show(int $id): JsonResponse
{
    $sale = Sale::with(['items', 'customer', 'branch', 'warehouse'])->findOrFail($id);
    
    // Explicit Record-Level Policy Authorization
    $this->authorize('view', $sale);
    
    return $this->successResponse(new SaleResource($sale));
}
```

In `SalePolicy.php`:
```php
public function view(User $user, Sale $sale): bool
{
    if ((int) $sale->company_id !== (int) $user->company_id) {
        return false;
    }

    if ($user->hasRole('super_admin')) {
        return true;
    }

    return $user->canAccessBranch((int) $sale->branch_id);
}
```

Result: Backend evaluates `$sale->branch_id`, discovers it is Branch B (which is not in Branch A Cashier's accessible branch list), and immediately terminates with **403 Forbidden**.

---

## 3. Stock Transfer Security: Dual-Warehouse Validation

In `StockTransferController.php`, inventory cannot be moved across unauthorized boundaries:
```php
$user = $request->user();

// Validate source warehouse access
if (!$user->canAccessWarehouse((int) $validated['from_warehouse_id'])) {
    return $this->errorResponse('Unauthorized access to source warehouse.', null, 403);
}

// Validate destination warehouse access
if (!$user->canAccessWarehouse((int) $validated['to_warehouse_id'])) {
    return $this->errorResponse('Unauthorized access to destination warehouse.', null, 403);
}
```
If a user tries to transfer stock into or out of a warehouse they do not manage, the request is rejected with `403`.

---

## 4. Frontend Alignment & Cache Invalidation

1. **Branch Switcher:**
   - The `/api/v1/branches` endpoint only returns branches returned by `$user->accessibleBranchIds()`.
   - Unauthorized branches are never rendered in the dropdown.
2. **Context Switching:**
   - When the user selects a new branch, the frontend sends the selected branch header/parameter.
   - TanStack React Query cache keys are scoped by branch (e.g., `['sales', { branchId: activeBranchId }]`).
   - Changing branches triggers cache invalidation to prevent stale cross-branch data display.
