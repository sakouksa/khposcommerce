<?php

namespace App\Services\Inventory;

use App\Models\Inventory\StockTransfer;

class StockTransferService
{
    public function transfer(int|string $fromWarehouseId, int|string $toWarehouseId, array $items = []): StockTransfer
    {
        return StockTransfer::create([
            'source_warehouse_id' => $fromWarehouseId,
            'destination_warehouse_id' => $toWarehouseId,
            'status' => 'pending',
        ]);
    }
}
