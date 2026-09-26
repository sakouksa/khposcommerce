<?php

namespace App\Services\Shipping\Contracts;

interface ShippingProvider
{
    public function calculateRate(array $data): array;
    public function createShipment(array $data): array;
    public function trackShipment(string $trackingNumber): array;
    public function cancelShipment(string $shipmentId): bool;
}
