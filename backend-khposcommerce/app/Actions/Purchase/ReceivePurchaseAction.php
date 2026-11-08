<?php

namespace App\Actions\Purchase;

use App\Models\Purchase\Purchase;
use Illuminate\Support\Facades\DB;

class ReceivePurchaseAction
{
    /**
     * Mark purchase order as received and record stock intake.
     */
    public function execute(Purchase|int|string $purchase): Purchase
    {
        return DB::transaction(function () use ($purchase) {
            $purchaseModel = $purchase instanceof Purchase ? $purchase : Purchase::findOrFail($purchase);
            $purchaseModel->update(['status' => 'received']);
            return $purchaseModel;
        });
    }
}
