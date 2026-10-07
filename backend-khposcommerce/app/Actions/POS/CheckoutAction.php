<?php

namespace App\Actions\POS;

use App\Models\Sales\Sale;
use Illuminate\Support\Facades\DB;

class CheckoutAction
{
    public function execute(array $saleData, array $items = []): Sale
    {
        return DB::transaction(function () use ($saleData, $items) {
            $sale = Sale::create($saleData);
            if (!empty($items)) {
                $sale->items()->createMany($items);
            }
            return $sale->load(['items', 'customer']);
        });
    }
}
