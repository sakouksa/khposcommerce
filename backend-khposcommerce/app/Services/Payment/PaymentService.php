<?php

namespace App\Services\Payment;

use App\Services\Payment\Contracts\PaymentGateway;
use App\Services\Payment\Gateways\CashPaymentGateway;
use App\Services\Payment\Gateways\KHQRPaymentGateway;
use App\Services\Payment\Gateways\StripePaymentGateway;
use App\Services\Payment\Gateways\ABAPayGateway;

class PaymentService
{
    private array $gateways = [];

    public function __construct()
    {
        $this->gateways = [
            'khqr'    => new KHQRPaymentGateway(),
            'cash'    => new CashPaymentGateway(),
            'cod'     => new CashPaymentGateway(),
            'stripe'  => new StripePaymentGateway(),
            'aba_pay' => new ABAPayGateway(),
        ];
    }

    public function getGateway(string $code = 'khqr'): PaymentGateway
    {
        return $this->gateways[$code] ?? $this->gateways['khqr'];
    }

    public function createPayment(string $gatewayCode, array $data): array
    {
        return $this->getGateway($gatewayCode)->createPayment($data);
    }

    public function verifyPayment(string $gatewayCode, array $data): array
    {
        return $this->getGateway($gatewayCode)->verifyPayment($data);
    }

    public function refund(string $gatewayCode, array $data): array
    {
        return $this->getGateway($gatewayCode)->refund($data);
    }
}
