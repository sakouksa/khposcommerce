<?php

namespace App\Policies;

use App\Models\Sales\SaleReturn;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SaleReturnPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') 
            || $user->hasPermissionTo('sale.return', 'api')
            || $user->hasPermissionTo('sale.view', 'api');
    }

    public function view(User $user, SaleReturn $saleReturn): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $saleReturn->company_id !== (int) $user->company_id) {
            return false;
        }

        if ($user->hasRole(['super_admin', 'owner'])) {
            return true;
        }

        $sale = $saleReturn->sale ?? $saleReturn->sale()->withoutGlobalScopes()->first();
        if (!$sale || !$user->canAccessBranch($sale->branch_id)) {
            return false;
        }

        return true;
    }

    public function create(User $user, ?int $branchId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('sale.return', 'api')
            || $user->hasPermissionTo('sale.refund', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null) {
            return $user->canAccessBranch($branchId);
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, SaleReturn $saleReturn): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('sale.return', 'api')
            || $user->hasPermissionTo('sale.refund', 'api');

        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $saleReturn);
    }

    public function delete(User $user, SaleReturn $saleReturn): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('sale.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $saleReturn);
    }
}
