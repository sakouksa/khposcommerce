<?php

namespace App\Services\OrderReturn;

use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\ReturnPolicy;
use Carbon\Carbon;

class ReturnPolicyEngineService
{
    /**
     * Determine eligibility for an order or item return/exchange.
     */
    public function evaluateEligibility(Order $order, OrderItem $item): array
    {
        $category = $item->product?->category;
        $policy = null;

        if ($category) {
            $policy = ReturnPolicy::where('company_id', $order->company_id)
                ->where('category_id', $category->id)
                ->first();
        }

        if (!$policy) {
            $policy = ReturnPolicy::where('company_id', $order->company_id)
                ->where('is_default', true)
                ->first();
        }

        // Fallback default policy if none exists in DB
        $windowDays = $policy ? $policy->return_window_days : 7;
        $isReturnable = $policy ? $policy->is_returnable : true;
        $allowExchange = $policy ? $policy->allow_exchange : true;

        if (!$isReturnable) {
            return [
                'eligible'        => false,
                'allow_return'    => false,
                'allow_exchange'  => false,
                'reason'          => "Products in category '{$category?->name}' are strictly non-returnable (Final Sale / Perishable / Custom).",
                'window_days'     => 0,
                'days_remaining'  => 0,
                'policy'          => $policy,
            ];
        }

        // Check delivery date
        $deliveredAt = $order->shipment?->delivered_at ?? $order->updated_at;
        if (!$deliveredAt) {
            $deliveredAt = $order->created_at;
        }

        $expiryDate = Carbon::parse($deliveredAt)->addDays($windowDays);
        $now = now();
        $isExpired = $now->isAfter($expiryDate);

        if ($isExpired) {
            return [
                'eligible'        => false,
                'allow_return'    => false,
                'allow_exchange'  => false,
                'reason'          => "The return window of {$windowDays} days expired on " . $expiryDate->toFormattedDateString() . ".",
                'window_days'     => $windowDays,
                'days_remaining'  => 0,
                'policy'          => $policy,
            ];
        }

        $daysRemaining = max(0, $now->diffInDays($expiryDate, false));

        return [
            'eligible'        => true,
            'allow_return'    => true,
            'allow_exchange'  => $allowExchange,
            'reason'          => 'Eligible for return and exchange.',
            'window_days'     => $windowDays,
            'days_remaining'  => (int)$daysRemaining,
            'policy'          => $policy,
        ];
    }

    /**
     * Compute applicable fees based on fault (customer vs store).
     */
    public function computeFaultFees(string $fault, ?ReturnPolicy $policy, float $itemSubtotal): array
    {
        $fault = strtolower($fault);

        if ($fault === 'store') {
            return [
                'restocking_fee'       => 0.00,
                'return_shipping_fee'  => 0.00,
                'exchange_fee'         => 0.00,
                'shipping_paid_by'     => 'store',
                'refund_outbound_ship' => true,
            ];
        }

        // Customer fault (change of mind, wrong size selected, etc.)
        $restockPct = (float)($policy?->restocking_fee_percentage ?? 0);
        $restockFlat = (float)($policy?->restocking_fee_flat ?? 0);
        $restockingFee = round(($itemSubtotal * ($restockPct / 100)) + $restockFlat, 2);

        $returnShipping = (float)($policy?->customer_fault_shipping_fee ?? 0);

        return [
            'restocking_fee'       => $restockingFee,
            'return_shipping_fee'  => $returnShipping,
            'exchange_fee'         => 0.00,
            'shipping_paid_by'     => 'customer',
            'refund_outbound_ship' => false,
        ];
    }
}
