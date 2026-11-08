<?php

namespace App\Policies;

use App\Models\Inventory\StockTransfer;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StockTransferPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') 
            || $user->hasPermissionTo('stock_transfer.view', 'api')
            || $user->hasPermissionTo('inventory.transfer', 'api');
    }

    public function view(User $user, StockTransfer $transfer): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $transfer->company_id !== (int) $user->company_id) {
            return false;
        }

        // User must have access to either source or destination warehouse to view
        return $user->canAccessWarehouse($transfer->from_warehouse_id)
            || $user->canAccessWarehouse($transfer->to_warehouse_id);
    }

    /**
     * CRITICAL SECURITY RULE:
     * To initiate a stock transfer, BOTH from_warehouse AND to_warehouse must be authorized.
     */
    public function create(User $user, ?int $fromWarehouseId = null, ?int $toWarehouseId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('stock_transfer.create', 'api')
            || $user->hasPermissionTo('stock_transfer.transfer', 'api')
            || $user->hasPermissionTo('inventory.transfer', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ($fromWarehouseId !== null && !$user->canAccessWarehouse($fromWarehouseId)) {
            return false;
        }

        if ($toWarehouseId !== null && !$user->canAccessWarehouse($toWarehouseId)) {
            return false;
        }

        return true;
    }

    public function update(User $user, StockTransfer $transfer): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('stock_transfer.update', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ((int) $transfer->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessWarehouse($transfer->from_warehouse_id)
            && $user->canAccessWarehouse($transfer->to_warehouse_id);
    }

    public function ship(User $user, StockTransfer $transfer): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('stock_transfer.update', 'api')
            || $user->hasPermissionTo('inventory.transfer', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ((int) $transfer->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessWarehouse($transfer->from_warehouse_id);
    }

    public function receive(User $user, StockTransfer $transfer): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('stock_transfer.update', 'api')
            || $user->hasPermissionTo('inventory.transfer', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ((int) $transfer->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessWarehouse($transfer->to_warehouse_id);
    }

    public function delete(User $user, StockTransfer $transfer): bool
    {
        $hasPerm = $user->hasRole('super_admin') 
            || $user->hasPermissionTo('stock_transfer.delete', 'api');

        if (!$hasPerm) {
            return false;
        }

        if ((int) $transfer->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessWarehouse($transfer->from_warehouse_id);
    }
}
