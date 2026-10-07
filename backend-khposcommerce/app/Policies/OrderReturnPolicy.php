<?php

namespace App\Policies;

use App\Models\Order\OrderReturn;
use App\Models\Order\Order;
use App\Models\Sales\Sale;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrderReturnPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') 
            || $user->hasPermissionTo('order.return', 'api')
            || $user->hasPermissionTo('order.view', 'api');
    }

    public function view(User $user, OrderReturn $return): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $return->company_id !== (int) $user->company_id) {
            return false;
        }

        if ($user->hasRole(['super_admin', 'owner'])) {
            return true;
        }

        if ($return->warehouse_id && $user->canAccessWarehouse($return->warehouse_id)) {
            return true;
        }

        if ($return->sale_id) {
            $sale = $return->sale ?? Sale::find($return->sale_id);
            if ($sale && $user->canAccessBranch($sale->branch_id)) {
                return true;
            }
        }

        if ($return->order_id) {
            $order = $return->order ?? Order::find($return->order_id);
            if ($order) {
                if ($order->warehouse_id && $user->canAccessWarehouse($order->warehouse_id)) {
                    return true;
                }
                $branchId = $order->branch_id ?? ($order->store?->branch_id ?? $order->store()->value('branch_id'));
                if ($branchId && $user->canAccessBranch((int) $branchId)) {
                    return true;
                }
            }
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('super_admin') 
            || $user->hasPermissionTo('order.return', 'api')
            || $user->hasPermissionTo('order.manage', 'api');
    }

    public function update(User $user, OrderReturn $return): bool
    {
        if (!$this->create($user)) {
            return false;
        }

        return $this->view($user, $return);
    }

    public function delete(User $user, OrderReturn $return): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('order.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $return);
    }
}
