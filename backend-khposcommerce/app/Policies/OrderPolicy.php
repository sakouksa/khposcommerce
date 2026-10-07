<?php

namespace App\Policies;

use App\Models\Order\Order;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrderPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('order.view', 'api');
    }

    public function view(User $user, Order $order): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $order->company_id !== (int) $user->company_id) {
            return false;
        }

        if ($order->warehouse_id && !$user->canAccessWarehouse($order->warehouse_id)) {
            return false;
        }

        $branchId = $order->branch_id ?? ($order->store?->branch_id ?? $order->store()->value('branch_id'));
        if ($branchId && !$user->canAccessBranch((int) $branchId)) {
            return false;
        }

        return true;
    }

    public function update(User $user, Order $order): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('order.update', 'api')
            || $user->hasPermissionTo('order.manage', 'api');

        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $order);
    }

    public function delete(User $user, Order $order): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('order.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $order);
    }
}
