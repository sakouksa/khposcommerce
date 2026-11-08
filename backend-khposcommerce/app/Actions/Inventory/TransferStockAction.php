<?php

namespace App\Actions\Inventory;

use App\Models\Inventory\Inventory;
use App\Models\Inventory\StockTransfer;
use Illuminate\Support\Facades\DB;

class TransferStockAction
{
    public function execute(int|string $sourceWarehouseId, int|string $destinationWarehouseId, int|string $productId, float $quantity): StockTransfer
    {
        return DB::transaction(function () use ($sourceWarehouseId, $destinationWarehouseId, $productId, $quantity) {
            $sourceInv = Inventory::where('product_id', $productId)
                ->where('warehouse_id', $sourceWarehouseId)
                ->lockForUpdate()
                ->firstOrFail();

            $sourceInv->quantity -= $quantity;
            $sourceInv->available_quantity = max(0, $sourceInv->quantity - $sourceInv->reserved_quantity);
            $sourceInv->save();

            $destInv = Inventory::firstOrCreate(
                ['product_id' => $productId, 'warehouse_id' => $destinationWarehouseId],
                ['quantity' => 0, 'available_quantity' => 0, 'reserved_quantity' => 0, 'company_id' => $sourceInv->company_id]
            );
            $destInv->quantity += $quantity;
            $destInv->available_quantity += $quantity;
            $destInv->save();

            return StockTransfer::create([
                'company_id' => $sourceInv->company_id,
                'source_warehouse_id' => $sourceWarehouseId,
                'destination_warehouse_id' => $destinationWarehouseId,
                'status' => 'completed',
            ]);
        });
    }
}
