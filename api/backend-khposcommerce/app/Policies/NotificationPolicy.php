<?php

namespace App\Policies;

use App\Models\Notification\Notification;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class NotificationPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks. Super Admin and Admins get full access automatically.
     */
    public function before(User $user, string $ability): ?bool
    {
        if (
            $user->id === 1 ||
            !empty($user->is_superadmin) ||
            $user->role === 'Super Admin' ||
            $user->role === 'super_admin' ||
            (method_exists($user, 'hasRole') && ($user->hasRole('Super Admin') || $user->hasRole('super_admin') || $user->hasRole('Admin')))
        ) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Notification $notification): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Notification $notification): bool
    {
        return true;
    }

    public function delete(User $user, Notification $notification): bool
    {
        return true;
    }
}
