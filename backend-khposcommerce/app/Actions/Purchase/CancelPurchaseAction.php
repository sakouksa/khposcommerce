<?php

namespace App\Actions\Purchase;

use App\Models\Purchase\Purchase;

class CancelPurchaseAction
{
    public function execute(Purchase|int|string $purchase): Purchase
    {
        $purchaseModel = $purchase instanceof Purchase ? $purchase : Purchase::findOrFail($purchase);
        $purchaseModel->update(['status' => 'cancelled']);
        return $purchaseModel;
    }
}
