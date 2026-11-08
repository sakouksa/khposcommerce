<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $authUser): bool
    {
        return $authUser->hasRole('super_admin') 
            || $authUser->hasPermissionTo('user.view', 'api');
    }

    public function view(User $authUser, User $targetUser): bool
    {
        if (!$this->viewAny($authUser)) {
            return false;
        }

        if ($authUser->hasRole('super_admin')) {
            return true;
        }

        if ((int) $authUser->company_id !== (int) $targetUser->company_id) {
            return false;
        }

        if ($authUser->hasRole('owner')) {
            return true;
        }

        if ((int) $authUser->id === (int) $targetUser->id) {
            return true;
        }

        $accessibleBranchIds = $authUser->accessibleBranchIds();
        if (empty($accessibleBranchIds)) {
            return false;
        }

        if ($targetUser->branch_id && in_array((int) $targetUser->branch_id, $accessibleBranchIds, true)) {
            return true;
        }

        // Check assigned user_branches pivot
        $targetBranchIds = $targetUser->accessibleBranchIds();
        return !empty(array_intersect($accessibleBranchIds, $targetBranchIds));
    }

    public function create(User $authUser, ?int $branchId = null): bool
    {
        $hasPerm = $authUser->hasRole('super_admin') 
            || $authUser->hasPermissionTo('user.create', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ($authUser->hasRole(['super_admin', 'owner'])) {
            return true;
        }

        if ($branchId !== null) {
            return $authUser->canAccessBranch($branchId);
        }

        return !empty($authUser->accessibleBranchIds());
    }

    public function update(User $authUser, User $targetUser): bool
    {
        $hasPerm = $authUser->hasRole('super_admin') 
            || $authUser->hasPermissionTo('user.update', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ($targetUser->hasRole('super_admin') && !$authUser->hasRole('super_admin')) {
            return false;
        }

        if ($targetUser->hasRole('owner') && !$authUser->hasRole(['super_admin', 'owner'])) {
            return false;
        }

        return $this->view($authUser, $targetUser);
    }

    public function delete(User $authUser, User $targetUser): bool
    {
        if ((int) $authUser->id === (int) $targetUser->id) {
            return false;
        }

        $hasPerm = $authUser->hasRole('super_admin') 
            || $authUser->hasPermissionTo('user.delete', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ($targetUser->hasRole(['super_admin', 'owner']) && !$authUser->hasRole('super_admin')) {
            return false;
        }

        return $this->view($authUser, $targetUser);
    }
}
