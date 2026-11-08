<?php

namespace App\Actions\Inventory;

use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use Illuminate\Support\Facades\DB;

class AdjustStockAction
{
    public function execute(int|string $productId, int|string $warehouseId, float $quantity, string $type = 'adjustment', string $reason = ''): Inventory
    {
        return DB::transaction(function () use ($productId, $warehouseId, $quantity, $type, $reason) {
            $inventory = Inventory::where('product_id', $productId)
                ->where('warehouse_id', $warehouseId)
                ->lockForUpdate()
                ->firstOrFail();

            $inventory->quantity = max(0, (float) $inventory->quantity + $quantity);
            $inventory->available_quantity = max(0, (float) $inventory->quantity - (float) $inventory->reserved_quantity);
            $inventory->save();

            InventoryMovement::create([
                'company_id' => $inventory->company_id,
                'branch_id' => $inventory->branch_id,
                'inventory_id' => $inventory->id,
                'product_id' => $productId,
                'movement_type' => $type,
                'quantity' => $quantity,
                'notes' => $reason,
            ]);

            return $inventory;
        });
    }
}
