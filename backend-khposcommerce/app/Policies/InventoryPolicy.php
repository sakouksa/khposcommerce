<?php

namespace App\Policies;

use App\Models\Inventory\Inventory;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InventoryPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasPermissionTo('inventory.view', 'api');
    }

    public function view(User $user, Inventory $inventory): bool
    {
        if (!$this->viewAny($user)) {
            return false;
        }

        if ((int) $inventory->company_id !== (int) $user->company_id) {
            return false;
        }

        return $user->canAccessWarehouse($inventory->warehouse_id);
    }

    public function create(User $user, ?int $warehouseId = null): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('inventory.create', 'api');
        if (!$hasPerm) {
            return false;
        }

        if ($warehouseId !== null) {
            return $user->canAccessWarehouse($warehouseId);
        }

        return !empty($user->accessibleWarehouseIds());
    }

    public function update(User $user, Inventory $inventory): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('inventory.update', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $inventory);
    }

    public function delete(User $user, Inventory $inventory): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('inventory.delete', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $inventory);
    }

    public function adjust(User $user, Inventory $inventory): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('inventory.adjust', 'api') || $user->hasPermissionTo('stock_adjustment.adjust', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $inventory);
    }

    public function transfer(User $user, Inventory $inventory): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('inventory.transfer', 'api') || $user->hasPermissionTo('stock_transfer.transfer', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $inventory);
    }

    public function opname(User $user, Inventory $inventory): bool
    {
        $hasPerm = $user->hasRole('super_admin') || $user->hasPermissionTo('inventory.opname', 'api') || $user->hasPermissionTo('stock_opname.opname', 'api');
        if (!$hasPerm) {
            return false;
        }

        return $this->view($user, $inventory);
    }
}
