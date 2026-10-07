<?php

namespace App\Policies;

use App\Models\Employee\Employee;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EmployeePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('employee.view', 'api');
    }

    public function view(User $user, Employee $employee): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $employee->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($employee->branch_id);
    }

    public function create(User $user, ?int $branchId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('employee.create', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null) {
            return $user->canAccessBranch($branchId);
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, Employee $employee): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('employee.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $employee->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($employee->branch_id);
    }

    public function delete(User $user, Employee $employee): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('employee.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $employee->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($employee->branch_id);
    }
}
