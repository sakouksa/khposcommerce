<?php

namespace App\Policies;

use App\Models\POS\CashRegister;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CashRegisterPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') 
            || $user->hasPermissionTo('cash_register.view', 'api')
            || $user->hasPermissionTo('pos.access', 'api');
    }

    public function view(User $user, CashRegister $register): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $register->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($register->branch_id);
    }

    public function create(User $user, ?int $branchId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('cash_register.create', 'api')
            || $user->hasPermissionTo('cash_register.manage', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null) {
            return $user->canAccessBranch($branchId);
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, CashRegister $register): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('cash_register.update', 'api')
            || $user->hasPermissionTo('cash_register.manage', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ((int) $register->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($register->branch_id);
    }

    public function delete(User $user, CashRegister $register): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('cash_register.delete', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ((int) $register->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($register->branch_id);
    }
}
