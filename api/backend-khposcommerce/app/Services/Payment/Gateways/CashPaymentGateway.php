<?php

namespace App\Services\Payment\Gateways;

use App\Services\Payment\Contracts\PaymentGateway;

class CashPaymentGateway implements PaymentGateway
{
    public function createPayment(array $data): array
    {
        return [
            'gateway'        => 'cash',
            'status'         => 'pending',
            'amount'         => (float) ($data['amount'] ?? 0),
            'currency'       => 'USD',
            'transaction_id' => 'COD-' . strtoupper(uniqid()),
            'instructions'   => 'Pay with cash upon package delivery to courier.',
        ];
    }

    public function verifyPayment(array $data): array
    {
        return [
            'verified' => true,
            'status'   => 'completed',
            'paid_at'  => now()->toIso8601String(),
        ];
    }

    public function refund(array $data): array
    {
        return [
            'success'   => true,
            'refund_id' => 'REF-CASH-' . uniqid(),
            'status'    => 'refunded',
        ];
    }
}
