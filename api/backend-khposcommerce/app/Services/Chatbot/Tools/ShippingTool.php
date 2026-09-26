<?php

namespace App\Services\Chatbot\Tools;

use App\Models\Shipping\ShippingMethod;
use App\Models\Shipping\ShippingRate;
use App\Models\Shipping\ShippingZone;

class ShippingTool
{
    /**
     * Get available shipping methods and estimated fees.
     */
    public function getShippingMethods(array $params = []): array
    {
        $methods = ShippingMethod::where('is_active', true)->get();

        return [
            'methods' => $methods->map(fn ($m) => [
                'id'         => $m->id,
                'name'       => $m->name,
                'code'       => $m->code,
                'carrier'    => $m->carrier,
                'base_price' => (float) ($m->base_price ?? 0),
                'currency'   => 'USD',
            ])->toArray(),
        ];
    }

    /**
     * Calculate shipping rate for a destination.
     */
    public function calculateShipping(array $params): array
    {
        $city = $params['city'] ?? null;
        $weight = (float) ($params['weight'] ?? 1.0);

        $methods = ShippingMethod::where('is_active', true)->get();

        $rates = $methods->map(function ($method) use ($weight) {
            $baseCost = (float) ($method->base_price ?? 5.0);
            $weightCost = max(0, ($weight - 1.0) * 1.5);
            $totalCost = $baseCost + $weightCost;

            return [
                'method_id'        => $method->id,
                'method_name'      => $method->name,
                'carrier'          => $method->carrier ?? 'Standard',
                'cost'             => round($totalCost, 2),
                'currency'         => 'USD',
                'estimated_days'   => $method->code === 'express' ? '1-2 Days' : '3-5 Days',
            ];
        });

        return [
            'destination_city' => $city ?? 'Standard Destination',
            'weight_kg'        => $weight,
            'available_rates'  => $rates->toArray(),
        ];
    }
}
