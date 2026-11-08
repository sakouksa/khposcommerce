<?php

namespace App\Policies;

use App\Models\Employee\Payroll;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PayrollPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('payroll.view', 'api');
    }

    public function view(User $user, Payroll $payroll): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $payroll->company_id !== (int) $user->company_id) {
            return false;
        }

        $employee = $payroll->employee ?: \App\Models\Employee\Employee::find($payroll->employee_id);
        if ($employee && $employee->branch_id) {
            return $user->canAccessBranch($employee->branch_id);
        }

        return true;
    }

    public function create(User $user, ?int $branchId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('payroll.create', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null) {
            return $user->canAccessBranch($branchId);
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, Payroll $payroll): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('payroll.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $payroll);
    }

    public function delete(User $user, Payroll $payroll): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('payroll.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $payroll);
    }
}
