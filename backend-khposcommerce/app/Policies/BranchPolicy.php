<?php

namespace App\Policies;

use App\Models\Company\Branch;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BranchPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('branch.view', 'api');
    }

    public function view(User $user, Branch $branch): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $branch->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($branch->id);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('branch.create', 'api');
    }

    public function update(User $user, Branch $branch): bool
    {
        if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('branch.update', 'api')) {
            return false;
        }

        if ((int) $branch->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessBranch($branch->id);
    }

    public function delete(User $user, Branch $branch): bool
    {
        // Deleting branches requires Owner (super_admin) or explicit branch.delete permission
        if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('branch.delete', 'api')) {
            return false;
        }

        if ((int) $branch->company_id !== (int) $user->company_id) {
            return false;
        }

        // Cannot delete main branch
        if ($branch->is_main) {
            return false;
        }

        return true;
    }
}
