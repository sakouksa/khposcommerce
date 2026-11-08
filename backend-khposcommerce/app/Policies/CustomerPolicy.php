<?php

namespace App\Policies;

use App\Models\Customer\Customer;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CustomerPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('customer.view', 'api');
    }

    public function view(User $user, ?Customer $customer = null): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ($customer === null) {
            return true;
        }

        return (int) $customer->company_id === (int) $user->company_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('customer.create', 'api');
    }

    public function update(User $user, ?Customer $customer = null): bool
    {
        if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('customer.update', 'api')) {
            return false;
        }

        if ($customer === null) {
            return true;
        }

        return (int) $customer->company_id === (int) $user->company_id;
    }

    public function delete(User $user, ?Customer $customer = null): bool
    {
        if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('customer.delete', 'api')) {
            return false;
        }

        if ($customer === null) {
            return true;
        }

        return (int) $customer->company_id === (int) $user->company_id;
    }
}
