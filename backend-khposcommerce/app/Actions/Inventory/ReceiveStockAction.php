<?php

namespace App\Actions\Inventory;

use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use Illuminate\Support\Facades\DB;

class ReceiveStockAction
{
    public function execute(int|string $productId, int|string $warehouseId, float $quantity, string $reference = ''): Inventory
    {
        return DB::transaction(function () use ($productId, $warehouseId, $quantity, $reference) {
            $inventory = Inventory::firstOrCreate(
                ['product_id' => $productId, 'warehouse_id' => $warehouseId],
                ['quantity' => 0, 'available_quantity' => 0, 'reserved_quantity' => 0]
            );

            $inventory->quantity += $quantity;
            $inventory->available_quantity += $quantity;
            $inventory->save();

            InventoryMovement::create([
                'company_id' => $inventory->company_id,
                'branch_id' => $inventory->branch_id,
                'inventory_id' => $inventory->id,
                'product_id' => $productId,
                'movement_type' => 'in',
                'quantity' => $quantity,
                'notes' => 'Received stock: ' . $reference,
            ]);

            return $inventory;
        });
    }
}
