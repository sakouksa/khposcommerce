<?php

namespace App\Actions\Purchase;

use App\Models\Purchase\Purchase;
use Illuminate\Support\Facades\DB;

class UpdatePurchaseAction
{
    public function execute(Purchase|int|string $purchase, array $data): Purchase
    {
        return DB::transaction(function () use ($purchase, $data) {
            $purchaseModel = $purchase instanceof Purchase ? $purchase : Purchase::findOrFail($purchase);
            $purchaseModel->update($data);
            return $purchaseModel;
        });
    }
}
