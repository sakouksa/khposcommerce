<?php

namespace App\Services\Shipping\Providers;

use App\Services\Shipping\Contracts\ShippingProvider;

class JTExpressProvider implements ShippingProvider
{
    public function calculateRate(array $data): array
    {
        $weight = (float) ($data['weight'] ?? 1.0);
        $cost = 3.50 + max(0, ($weight - 1) * 1.2);

        return [
            'provider'       => 'jnt',
            'carrier'        => 'J&T Express',
            'cost'           => round($cost, 2),
            'currency'       => 'USD',
            'estimated_days' => '1-2 Days',
        ];
    }

    public function createShipment(array $data): array
    {
        $trackingNumber = 'JT' . mt_rand(100000000, 999999999);
        return [
            'success'         => true,
            'shipment_id'     => 'JNT-' . uniqid(),
            'tracking_number' => $trackingNumber,
            'carrier'         => 'J&T Express',
            'status'          => 'picked_up',
        ];
    }

    public function trackShipment(string $trackingNumber): array
    {
        return [
            'tracking_number' => $trackingNumber,
            'carrier'         => 'J&T Express',
            'status'          => 'out_for_delivery',
            'location'        => 'Local Hub',
            'estimated_days'  => 'Tomorrow',
        ];
    }

    public function cancelShipment(string $shipmentId): bool
    {
        return true;
    }
}
