# 🛡️ Spatie RBAC Authorization & 169 Permission Nodes

## 1. Overview
Access control across all OptaPOS platforms is governed by **Spatie Laravel-Permission v6**, featuring **169 granular permission nodes** structured around domain namespaces.

---

## 2. Permission Namespace Hierarchy

```
{module}.{feature}.{action}
```
Examples:
- `products.catalog.create`
- `inventory.adjustments.approve`
- `pos.shift.close`
- `payroll.tax_calculation.generate`

---

## 3. Predefined Enterprise Roles

1. **Super Admin**: Bypasses all gate checks; complete multi-company system access.
2. **Branch Manager**: Full operational authority over assigned branch and warehouse.
3. **Cashier / POS Operator**: Limited to open/close shift, barcode sales, and receipt printing.
4. **Inventory Clerk**: Access to stock transfers, adjustments, and purchase receiving.
5. **HR & Payroll Officer**: Access to employee attendance, leaves, and salary slips.
6. **Accountant / Auditor**: View-only access to financial reports and journals.

---

## 4. Multi-Tenant Branch ID Data Isolation

OptaPOS applies global Eloquent scopes to prevent branch data leakage:

```php
namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait HasBranchScope
{
    protected static function bootHasBranchScope(): void
    {
        static::addGlobalScope('branch_id', function (Builder $builder) {
            if (Auth::check() && !Auth::user()->hasRole('Super Admin')) {
                $builder->where('branch_id', Auth::user()->branch_id);
            }
        });
    }
}
```

---
*Related Docs:*
- [Backend Application Manual](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/applications/backend/README.md)
- [Admin Dashboard Setup](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/applications/admin-dashboard/README.md)
