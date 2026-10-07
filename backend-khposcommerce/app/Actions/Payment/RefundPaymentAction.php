<?php

namespace App\Actions\Payment;

use App\Models\Payment\Payment;
use Illuminate\Support\Facades\DB;

class RefundPaymentAction
{
    public function execute(Payment|int|string $payment, float $amount, string $reason = ''): Payment
    {
        return DB::transaction(function () use ($payment, $amount, $reason) {
            $paymentModel = $payment instanceof Payment ? $payment : Payment::findOrFail($payment);
            $paymentModel->update([
                'status' => 'refunded',
                'notes' => $reason,
            ]);
            return $paymentModel;
        });
    }
}
