<?php

namespace App\Policies;

use App\Models\Employee\Attendance;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AttendancePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('attendance.view', 'api');
    }

    public function view(User $user, Attendance $attendance): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $attendance->company_id !== (int) $user->company_id) {
            return false;
        }

        return $attendance->branch_id ? $user->canAccessBranch($attendance->branch_id) : true;
    }

    public function create(User $user, ?int $branchId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('attendance.create', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ($branchId !== null) {
            return $user->canAccessBranch($branchId);
        }

        return !empty($user->accessibleBranchIds());
    }

    public function update(User $user, Attendance $attendance): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('attendance.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $attendance);
    }

    public function delete(User $user, Attendance $attendance): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('attendance.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $attendance);
    }
}
