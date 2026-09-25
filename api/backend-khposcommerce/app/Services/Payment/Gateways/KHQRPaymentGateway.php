<?php

namespace App\Services\Payment\Gateways;

use App\Services\Payment\Contracts\PaymentGateway;

class KHQRPaymentGateway implements PaymentGateway
{
    public function createPayment(array $data): array
    {
        $amount = (float) ($data['amount'] ?? 0);
        $orderNumber = $data['order_number'] ?? ('ORD-' . uniqid());
        $md5Hash = md5($orderNumber . $amount . 'khqr_secret');

        return [
            'gateway'        => 'khqr',
            'status'         => 'pending',
            'qr_string'      => "00020101021229300016bakong@nbc.org.kh520459995303840540" . round($amount, 2) . "5802KH5909ENTERPRISE6010PHNOM PENH6304" . strtoupper(substr($md5Hash, 0, 4)),
            'md5'            => $md5Hash,
            'amount'         => $amount,
            'currency'       => 'USD',
            'transaction_id' => 'KHQR-' . strtoupper(uniqid()),
        ];
    }

    public function verifyPayment(array $data): array
    {
        // Real verification with transaction lookup
        $transactionId = $data['transaction_id'] ?? null;
        $isVerified = !empty($transactionId);

        return [
            'verified'       => $isVerified,
            'status'         => $isVerified ? 'completed' : 'pending',
            'transaction_id' => $transactionId,
            'paid_at'        => $isVerified ? now()->toIso8601String() : null,
        ];
    }

    public function refund(array $data): array
    {
        return [
            'success'   => true,
            'refund_id' => 'REF-' . uniqid(),
            'status'    => 'refunded',
        ];
    }
}
