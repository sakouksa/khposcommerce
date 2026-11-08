# 🛡️ KHPosCommerce — End-to-End Authorization System

## 1. Multi-Tier Security Architecture

KHPosCommerce enforces defense-in-depth across both backend and frontend layers:

```
[ FRONTEND TIER (UX Boundary) ]
  ├── 1. ProtectedRoute (Route Guard with <AccessDeniedPage /> fallback)
  ├── 2. AdminLayout Navigation (Filters visible groups & items via hasPermission)
  └── 3. Page Component Action Guards (Hides/disables buttons: canCreate, canEdit, canDelete)

            ↓↓↓ (HTTP REST API with JWT Bearer Token)

[ BACKEND TIER (Final Security Authority) ]
  ├── 1. auth.jwt Middleware (Validates token authenticity, signature, and expiration)
  ├── 2. Spatie Permission Middleware (permission:[module].[action] rejects unauthorized HTTP calls)
  ├── 3. AccessScopeService (Constrains database queries by company_id, branch_id, warehouse_id)
  ├── 4. Eloquent Policies / IDOR Checks (Validates ownership of record ID before update/delete)
  └── 5. FormRequest Validation (Validates strict inputs & prevents payload tampering)
```

---

## 2. Frontend Implementation Standards

### A. Protected Routes (`webclient/admin-khposcommerce/src/routes/guards/ProtectedRoute.tsx`)
All administrative routes are protected using `<ProtectedRoute permission="...">`:
```tsx
<Route 
  path="/products" 
  element={
    <ProtectedRoute permission="product.view">
      <ProductsPage />
    </ProtectedRoute>
  } 
/>
```
If the user lacks `product.view`, direct URL entry is intercepted immediately and renders `<AccessDeniedPage />`. No private component lifecycle or network calls are triggered.

### B. Action Button Guards in React Pages
Actions inside a page must never assume `.view` grants action access:
```tsx
const { hasPermission } = usePermission()
const canCreate = hasPermission('product.create')
const canEdit   = hasPermission('product.update')
const canDelete = hasPermission('product.delete')
const canExport = hasPermission('product.export')
const canImport = hasPermission('product.import')
```
- Create modal trigger: `{canCreate && <AddButton />}`
- Import modal trigger: `{canImport && <ImportButton />}`
- Export trigger: `{canExport && <ExportButton />}`
- Row action delete: `{canDelete && <DeleteActionButton />}`

---

## 3. Backend Implementation Standards

### A. Spatie Permission Route Middleware
Every endpoint registered in `routes/api/v1/admin.php` has explicit middleware:
```php
Route::get('products',         [ProductController::class, 'index'])->middleware('permission:product.view');
Route::post('products',        [ProductController::class, 'store'])->middleware('permission:product.create');
Route::put('products/{id}',    [ProductController::class, 'update'])->middleware('permission:product.update');
Route::delete('products/{id}', [ProductController::class, 'destroy'])->middleware('permission:product.delete');
Route::get('products/export',  [ProductController::class, 'export'])->middleware('permission:product.export');
Route::post('products/import', [ProductController::class, 'import'])->middleware('permission:product.import');
```

### B. Scope Filtering in Repositories / Controllers
```php
$user = auth()->user();
$accessibleBranches = $user->accessibleBranchIds();

$query->whereIn('branch_id', $accessibleBranches);
```
Even if an attacker attempts an IDOR attack by requesting `GET /api/v1/sales/200` belonging to Branch B while logged into Branch A, the scoping query returns `404 Not Found` or `403 Forbidden`.
