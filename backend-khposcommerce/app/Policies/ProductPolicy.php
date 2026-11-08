<?php

namespace App\Policies;

use App\Models\Product\Product;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('product.view', 'api');
    }

    public function view(User $user, ?Product $product = null): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ($product === null) {
            return true;
        }

        return (int) $product->company_id === (int) $user->company_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('product.create', 'api');
    }

    public function update(User $user, ?Product $product = null): bool
    {
        if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('product.update', 'api')) {
            return false;
        }

        if ($product === null) {
            return true;
        }

        return (int) $product->company_id === (int) $user->company_id;
    }

    public function delete(User $user, ?Product $product = null): bool
    {
        if (!$user->hasRole('super_admin') && !$user->hasPermissionTo('product.delete', 'api')) {
            return false;
        }

        if ($product === null) {
            return true;
        }

        return (int) $product->company_id === (int) $user->company_id;
    }
}
