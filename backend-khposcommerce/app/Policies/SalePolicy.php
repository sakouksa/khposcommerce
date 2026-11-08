<?php

namespace App\Policies;

use App\Models\Sales\Sale;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SalePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('sale.view', 'api');
    }

    public function view(User $user, Sale $sale): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $sale->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($sale->branch_id);
    }

    public function create(User $user, ?int $branchId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('sale.create', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null) {
            return $user->canAccessBranch($branchId);
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, Sale $sale): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('sale.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $sale->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($sale->branch_id);
    }

    public function delete(User $user, Sale $sale): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('sale.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $sale->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($sale->branch_id);
    }

    public function refund(User $user, Sale $sale): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('sale.refund', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $sale->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($sale->branch_id);
    }

    public function return(User $user, Sale $sale): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('sale.return', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $sale->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($sale->branch_id);
    }
}
