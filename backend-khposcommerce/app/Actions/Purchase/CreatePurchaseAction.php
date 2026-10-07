<?php

namespace App\Actions\Purchase;

use App\Models\Purchase\Purchase;
use Illuminate\Support\Facades\DB;

class CreatePurchaseAction
{
    public function execute(array $data, array $items = []): Purchase
    {
        return DB::transaction(function () use ($data, $items) {
            $purchase = Purchase::create($data);
            if (!empty($items)) {
                $purchase->items()->createMany($items);
            }
            return $purchase->load('items');
        });
    }
}
