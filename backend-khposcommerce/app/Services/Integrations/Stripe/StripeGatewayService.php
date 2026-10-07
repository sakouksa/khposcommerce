<?php

namespace App\Services\Integrations\Stripe;

use App\Services\Payment\Gateways\StripePaymentGateway;

class StripeGatewayService
{
    public function __construct(protected ?StripePaymentGateway $gateway = null)
    {
    }

    /**
     * Create Stripe payment intent or checkout session.
     */
    public function createPaymentIntent(array $payload): array
    {
        if ($this->gateway) {
            return $this->gateway->charge($payload);
        }

        return [
            'success' => true,
            'client_secret' => 'pi_mock_secret_' . bin2hex(random_bytes(16)),
            'id' => 'pi_' . bin2hex(random_bytes(12)),
        ];
    }
}
