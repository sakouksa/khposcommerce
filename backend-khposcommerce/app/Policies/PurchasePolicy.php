<?php

namespace App\Policies;

use App\Models\Purchase\Purchase;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PurchasePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('purchase.view', 'api');
    }

    public function view(User $user, Purchase $purchase): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $purchase->company_id !== (int) $user->company_id) {
            return false;
        }

        if ($purchase->branch_id && !$user->canAccessBranch($purchase->branch_id)) {
            return false;
        }

        if ($purchase->warehouse_id && !$user->canAccessWarehouse($purchase->warehouse_id)) {
            return false;
        }

        return true;
    }

    public function create(User $user, ?int $branchId = null, ?int $warehouseId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('purchase.create', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null && !$user->canAccessBranch($branchId)) {
            return false;
        }

        if ($warehouseId !== null && !$user->canAccessWarehouse($warehouseId)) {
            return false;
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, Purchase $purchase): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('purchase.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $purchase);
    }

    public function delete(User $user, Purchase $purchase): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('purchase.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $purchase);
    }

    public function approve(User $user, Purchase $purchase): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('purchase.approve', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $purchase);
    }

    public function receive(User $user, Purchase $purchase): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('purchase.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $purchase);
    }
}
