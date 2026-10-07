<?php

namespace App\Services\Shipping\Providers;

use App\Services\Shipping\Contracts\ShippingProvider;

class GrabExpressProvider implements ShippingProvider
{
    public function calculateRate(array $data): array
    {
        return [
            'provider'       => 'grab_express',
            'carrier'        => 'GrabExpress Same-Day',
            'cost'           => 6.50,
            'currency'       => 'USD',
            'estimated_days' => 'Same Day (2-4 Hours)',
        ];
    }

    public function createShipment(array $data): array
    {
        $trackingNumber = 'GRAB-' . strtoupper(uniqid());
        return [
            'success'         => true,
            'shipment_id'     => 'GRB-' . uniqid(),
            'tracking_number' => $trackingNumber,
            'carrier'         => 'GrabExpress',
            'status'          => 'in_transit',
        ];
    }

    public function trackShipment(string $trackingNumber): array
    {
        return [
            'tracking_number' => $trackingNumber,
            'carrier'         => 'GrabExpress',
            'status'          => 'in_transit',
            'location'        => 'Driver assigned and en route',
            'estimated_days'  => 'Within 2 hours',
        ];
    }

    public function cancelShipment(string $shipmentId): bool
    {
        return true;
    }
}
