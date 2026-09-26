<?php

namespace App\Services\Shipping\Providers;

use App\Services\Shipping\Contracts\ShippingProvider;

class StandardDeliveryProvider implements ShippingProvider
{
    public function calculateRate(array $data): array
    {
        $weight = (float) ($data['weight'] ?? 1.0);
        $cost = 5.00 + max(0, ($weight - 1) * 1.5);

        return [
            'provider'       => 'standard',
            'carrier'        => 'Standard Delivery',
            'cost'           => round($cost, 2),
            'currency'       => 'USD',
            'estimated_days' => '2-4 Business Days',
        ];
    }

    public function createShipment(array $data): array
    {
        $trackingNumber = 'STD-' . strtoupper(uniqid());
        return [
            'success'         => true,
            'shipment_id'     => 'SHIP-' . uniqid(),
            'tracking_number' => $trackingNumber,
            'carrier'         => 'Standard Delivery',
            'status'          => 'pending',
        ];
    }

    public function trackShipment(string $trackingNumber): array
    {
        return [
            'tracking_number' => $trackingNumber,
            'carrier'         => 'Standard Delivery',
            'status'          => 'in_transit',
            'location'        => 'Central Distribution Center',
            'estimated_days'  => '2 Days',
        ];
    }

    public function cancelShipment(string $shipmentId): bool
    {
        return true;
    }
}
