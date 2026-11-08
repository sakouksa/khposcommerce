<?php

namespace App\Actions\Sales;

use App\Models\Sales\Sale;
use Illuminate\Support\Facades\DB;

class RefundSaleAction
{
    public function execute(Sale|int|string $sale, float $refundAmount, string $reason = ''): Sale
    {
        return DB::transaction(function () use ($sale, $refundAmount, $reason) {
            $saleModel = $sale instanceof Sale ? $sale : Sale::findOrFail($sale);
            $saleModel->update(['status' => 'refunded']);
            return $saleModel;
        });
    }
}
