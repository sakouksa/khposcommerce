<?php

namespace App\Actions\Sales;

use App\Models\Sales\Sale;

class CancelSaleAction
{
    public function execute(Sale|int|string $sale): Sale
    {
        $saleModel = $sale instanceof Sale ? $sale : Sale::findOrFail($sale);
        $saleModel->update(['status' => 'cancelled']);
        return $saleModel;
    }
}
