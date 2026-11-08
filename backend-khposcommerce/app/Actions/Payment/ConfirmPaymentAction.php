<?php

namespace App\Actions\Payment;

use App\Models\Payment\Payment;
use Illuminate\Support\Facades\DB;

class ConfirmPaymentAction
{
    public function execute(Payment|int|string $payment, ?string $transactionRef = null): Payment
    {
        return DB::transaction(function () use ($payment, $transactionRef) {
            $paymentModel = $payment instanceof Payment ? $payment : Payment::findOrFail($payment);
            $paymentModel->update([
                'status' => 'completed',
                'transaction_reference' => $transactionRef ?? $paymentModel->transaction_reference,
            ]);
            return $paymentModel;
        });
    }
}
