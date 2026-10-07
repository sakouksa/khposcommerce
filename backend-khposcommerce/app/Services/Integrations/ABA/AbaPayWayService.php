<?php

namespace App\Services\Integrations\ABA;

use App\Services\Payment\Gateways\ABAPayGateway;

class AbaPayWayService
{
    public function __construct(protected ?ABAPayGateway $gateway = null)
    {
    }

    /**
     * Create ABA PayWay checkout session / payment request.
     */
    public function createTransaction(array $payload): array
    {
        if ($this->gateway) {
            return $this->gateway->charge($payload);
        }

        return [
            'success' => true,
            'tran_id' => $payload['tran_id'] ?? uniqid('aba_'),
            'amount' => $payload['amount'] ?? 0,
            'payment_url' => 'https://checkout.payway.com.kh',
        ];
    }
}
