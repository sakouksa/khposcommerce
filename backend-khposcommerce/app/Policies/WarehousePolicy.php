<?php

namespace App\Policies;

use App\Models\Company\Warehouse;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class WarehousePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('warehouse.view', 'api');
    }

    public function view(User $user, Warehouse $warehouse): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $warehouse->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($warehouse->branch_id);
    }

    public function create(User $user, ?int $branchId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('warehouse.create', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null) {
            return $user->canAccessBranch($branchId);
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, Warehouse $warehouse): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('warehouse.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $warehouse->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($warehouse->branch_id);
    }

    public function delete(User $user, Warehouse $warehouse): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('warehouse.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $warehouse->company_id !== (int) $user->company_id) {
            return false;
        }

        if ($warehouse->is_main) {
            return false;
        }

        return $user->canAccessBranch($warehouse->branch_id);
    }
}
