<?php

namespace App\Policies;

use App\Models\Expense\Expense;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExpensePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('expense.view', 'api');
    }

    public function view(User $user, Expense $expense): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $expense->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($expense->branch_id);
    }

    public function create(User $user, ?int $branchId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('expense.create', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null) {
            return $user->canAccessBranch($branchId);
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, Expense $expense): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('expense.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $expense->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($expense->branch_id);
    }

    public function delete(User $user, Expense $expense): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('expense.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $expense->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($expense->branch_id);
    }

    public function approve(User $user, Expense $expense): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('expense.approve', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ((int) $expense->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($expense->branch_id);
    }
}
