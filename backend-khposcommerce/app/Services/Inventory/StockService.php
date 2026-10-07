<?php

namespace App\Services\Inventory;

use App\Models\Inventory\Inventory;

class StockService
{
    public function getAvailableStock(int|string $productId, int|string $warehouseId): float
    {
        $inventory = Inventory::where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->first();

        return $inventory ? (float) $inventory->available_quantity : 0.0;
    }
}
