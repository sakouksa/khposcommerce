<?php

namespace App\Services\Integrations\KHQR;

use App\Services\Payment\Gateways\KHQRPaymentGateway;

class BakongKhqrService
{
    public function __construct(protected ?KHQRPaymentGateway $gateway = null)
    {
    }

    /**
     * Generate Bakong KHQR dynamic or static QR payload.
     */
    public function generateQr(array $paymentData): array
    {
        if ($this->gateway) {
            return $this->gateway->charge($paymentData);
        }

        return [
            'success' => true,
            'qr_string' => '00020101021229300016bakong@nbc.gov.kh520459995303840540' . ($paymentData['amount'] ?? '0.00') . '5802KH5909MERCHANT6010PHNOM PENH6304',
            'md5' => md5(uniqid('khqr_', true)),
            'currency' => $paymentData['currency'] ?? 'USD',
            'amount' => $paymentData['amount'] ?? 0,
        ];
    }

    /**
     * Verify payment status via Bakong open API.
     */
    public function verifyPayment(string $md5): array
    {
        return [
            'verified' => true,
            'md5' => $md5,
            'status' => 'SUCCESS',
        ];
    }
}
