<?php

namespace App\Services\Sales;

use App\Models\Marketing\Coupon;
use Carbon\Carbon;

class PricingService
{
    public function __construct(
        protected ?PricingEngineService $pricingEngine = null
    ) {
        $this->pricingEngine = $pricingEngine ?? app(PricingEngineService::class);
    }

    /**
     * Calculate line item totals (subtotal, discount amount, tax amount, total).
     */
    public function calculateLineItem(
        float $unitPrice,
        float $quantity,
        float $discountPercent = 0.0,
        float $taxPercent = 0.0
    ): array {
        $subtotal = round($unitPrice * $quantity, 2);
        $discount = round($subtotal * ($discountPercent / 100), 2);
        $afterDiscount = max(0.0, $subtotal - $discount);
        $tax = round($afterDiscount * ($taxPercent / 100), 2);
        $total = round($afterDiscount + $tax, 2);

        return [
            'unit_price'      => $unitPrice,
            'quantity'        => $quantity,
            'subtotal'        => $subtotal,
            'discount_amount' => $discount,
            'tax_amount'      => $tax,
            'total'           => $total,
        ];
    }

    /**
     * Validate a coupon against subtotal and customer.
     */
    public function validateCoupon(string $code, float $subtotal, ?int $customerId = null, ?int $branchId = null): array
    {
        $res = $this->pricingEngine->validateAndApplyCoupon($code, $subtotal, $customerId, $branchId);
        if ($res['valid']) {
            return [
                'valid'           => true,
                'message'         => $res['message'],
                'discount'        => $res['discount_amount'],
                'discount_amount' => $res['discount_amount'],
                'coupon'          => $res['coupon'],
                'campaign_id'     => $res['campaign_id'] ?? null,
            ];
        }

        // Fallback to legacy Coupon table if not in promotion_coupons
        $coupon = Coupon::where('code', strtoupper(trim($code)))
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return [
                'valid'           => false,
                'message'         => $res['message'] ?: 'Coupon code is invalid or does not exist.',
                'discount'        => 0.0,
                'discount_amount' => 0.0,
                'coupon'          => null,
            ];
        }

        $now = Carbon::now();
        if ($coupon->starts_at && $now->lt(Carbon::parse($coupon->starts_at))) {
            return [
                'valid'           => false,
                'message'         => 'Coupon is not yet active.',
                'discount'        => 0.0,
                'discount_amount' => 0.0,
                'coupon'          => null,
            ];
        }

        if ($coupon->expires_at && $now->gt(Carbon::parse($coupon->expires_at))) {
            return [
                'valid'           => false,
                'message'         => 'Coupon has expired.',
                'discount'        => 0.0,
                'discount_amount' => 0.0,
                'coupon'          => null,
            ];
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return [
                'valid'           => false,
                'message'         => 'Coupon usage limit has been reached.',
                'discount'        => 0.0,
                'discount_amount' => 0.0,
                'coupon'          => null,
            ];
        }

        if ($coupon->min_purchase && $subtotal < (float) $coupon->min_purchase) {
            return [
                'valid'           => false,
                'message'         => 'Minimum spend of $' . number_format($coupon->min_purchase, 2) . ' required.',
                'discount'        => 0.0,
                'discount_amount' => 0.0,
                'coupon'          => null,
            ];
        }

        $discount = 0.0;
        if ($coupon->type === 'percentage') {
            $discount = round($subtotal * ((float) $coupon->value / 100), 2);
            if ($coupon->max_discount && $discount > (float) $coupon->max_discount) {
                $discount = (float) $coupon->max_discount;
            }
        } else {
            $discount = min($subtotal, (float) $coupon->value);
        }

        return [
            'valid'           => true,
            'message'         => 'Coupon applied successfully.',
            'discount'        => $discount,
            'discount_amount' => $discount,
            'coupon'          => $coupon,
        ];
    }
}
