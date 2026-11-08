<?php

namespace App\Policies;

use App\Models\Supplier\Supplier;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SupplierPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('supplier.view', 'api');
    }

    public function view(User $user, ?Supplier $supplier = null): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ($supplier === null) {
            return true;
        }

        return (int) $supplier->company_id === (int) $user->company_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('supplier.create', 'api');
    }

    public function update(User $user, ?Supplier $supplier = null): bool
    {
        if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('supplier.update', 'api')) {
            return false;
        }

        if ($supplier === null) {
            return true;
        }

        return (int) $supplier->company_id === (int) $user->company_id;
    }

    public function delete(User $user, ?Supplier $supplier = null): bool
    {
        if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('supplier.delete', 'api')) {
            return false;
        }

        if ($supplier === null) {
            return true;
        }

        return (int) $supplier->company_id === (int) $user->company_id;
    }
}
