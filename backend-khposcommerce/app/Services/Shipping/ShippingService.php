<?php

namespace App\Services\Shipping;

use App\Services\Shipping\Contracts\ShippingProvider;
use App\Services\Shipping\Providers\StandardDeliveryProvider;
use App\Services\Shipping\Providers\JTExpressProvider;
use App\Services\Shipping\Providers\GrabExpressProvider;

class ShippingService
{
    private array $providers = [];

    public function __construct()
    {
        $this->providers = [
            'standard'     => new StandardDeliveryProvider(),
            'jnt'          => new JTExpressProvider(),
            'grab_express' => new GrabExpressProvider(),
        ];
    }

    public function getProvider(string $code = 'standard'): ShippingProvider
    {
        return $this->providers[$code] ?? $this->providers['standard'];
    }

    public function calculateRate(string $providerCode, array $data): array
    {
        return $this->getProvider($providerCode)->calculateRate($data);
    }

    public function createShipment(string $providerCode, array $data): array
    {
        return $this->getProvider($providerCode)->createShipment($data);
    }

    public function trackShipment(string $providerCode, string $trackingNumber): array
    {
        return $this->getProvider($providerCode)->trackShipment($trackingNumber);
    }
}
