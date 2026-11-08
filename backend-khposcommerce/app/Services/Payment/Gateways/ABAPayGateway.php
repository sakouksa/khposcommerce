<?php

namespace App\Services\Payment\Gateways;

use App\Services\Payment\Contracts\PaymentGateway;

class ABAPayGateway implements PaymentGateway
{
    public function createPayment(array $data): array
    {
        $amount = (float) ($data['amount'] ?? 0);
        return [
            'gateway'        => 'aba_pay',
            'status'         => 'pending',
            'deep_link'      => 'https://link.payway.com.kh/aba?id=' . uniqid(),
            'amount'         => $amount,
            'currency'       => 'USD',
            'transaction_id' => 'ABA-' . strtoupper(uniqid()),
        ];
    }

    public function verifyPayment(array $data): array
    {
        $txn = $data['transaction_id'] ?? null;
        return [
            'verified'       => !empty($txn),
            'status'         => !empty($txn) ? 'completed' : 'pending',
            'transaction_id' => $txn,
            'paid_at'        => now()->toIso8601String(),
        ];
    }

    public function refund(array $data): array
    {
        return [
            'success'   => true,
            'refund_id' => 'REF-ABA-' . uniqid(),
            'status'    => 'refunded',
        ];
    }
}
