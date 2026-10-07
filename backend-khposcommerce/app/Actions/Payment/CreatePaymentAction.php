<?php

namespace App\Actions\Payment;

use App\Models\Payment\Payment;
use Illuminate\Support\Facades\DB;

class CreatePaymentAction
{
    public function execute(array $paymentData): Payment
    {
        return DB::transaction(function () use ($paymentData) {
            return Payment::create($paymentData);
        });
    }
}
