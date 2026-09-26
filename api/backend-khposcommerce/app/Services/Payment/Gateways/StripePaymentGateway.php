<?php

namespace App\Services\Payment\Gateways;

use App\Services\Payment\Contracts\PaymentGateway;

class StripePaymentGateway implements PaymentGateway
{
    public function createPayment(array $data): array
    {
        $amount = (float) ($data['amount'] ?? 0);
        return [
            'gateway'           => 'stripe',
            'status'            => 'pending',
            'client_secret'     => 'pi_' . uniqid() . '_secret_' . uniqid(),
            'amount'            => $amount,
            'currency'          => 'USD',
            'transaction_id'    => 'txn_stripe_' . uniqid(),
        ];
    }

    public function verifyPayment(array $data): array
    {
        $txn = $data['transaction_id'] ?? null;
        return [
            'verified'       => !empty($txn),
            'status'         => !empty($txn) ? 'completed' : 'failed',
            'transaction_id' => $txn,
            'paid_at'        => now()->toIso8601String(),
        ];
    }

    public function refund(array $data): array
    {
        return [
            'success'   => true,
            'refund_id' => 're_' . uniqid(),
            'status'    => 'refunded',
        ];
    }
}
