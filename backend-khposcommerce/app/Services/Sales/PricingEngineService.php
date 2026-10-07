<?php

namespace App\Services\Sales;

use App\Models\Company\Company;
use App\Models\Customer\Customer;
use App\Models\Marketing\PromotionCampaign;
use App\Models\Marketing\PromotionCoupon;
use App\Models\Marketing\PromotionRule;
use App\Models\Marketing\PromotionUsage;
use App\Models\Product\Product;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PricingEngineService
{
    /**
     * Calculate comprehensive promotion discounts and price breakdown for POS, Web, and Mobile.
     *
     * @param array $payload [
     *     'company_id'  => int,
     *     'branch_id'   => int,
     *     'channel'     => 'pos' | 'web' | 'mobile',
     *     'customer_id' => ?int,
     *     'items'       => [
     *         ['product_id' => int, 'product_variant_id' => ?int, 'quantity' => float, 'unit_price' => ?float]
     *     ],
     *     'coupon_code' => ?string,
     *     'tax_rate'    => ?float
     * ]
     * @return array
     */
    public function calculate(array $payload): array
    {
        $companyId  = (int) ($payload['company_id'] ?? 1);
        $branchId   = (int) ($payload['branch_id'] ?? 1);
        $channel    = strtolower(trim((string) ($payload['channel'] ?? 'pos')));
        $customerId = !empty($payload['customer_id']) ? (int) $payload['customer_id'] : null;
        $couponCode = !empty($payload['coupon_code']) ? strtoupper(trim((string) $payload['coupon_code'])) : null;
        $taxRate    = (float) ($payload['tax_rate'] ?? 0.0);

        // 1. Resolve Customer & Customer Group
        $customer = $customerId ? Customer::find($customerId) : null;
        $customerGroupId = $customer?->customer_group_id;

        // 2. Fetch Active Eligible Campaigns
        $campaigns = $this->getEligibleCampaigns($companyId, $branchId, $channel, $customerId, $customerGroupId);

        // 3. Eager-load products to preserve original base prices (NEVER mutate product.price directly)
        $rawItems = $payload['items'] ?? [];
        $productIds = collect($rawItems)->pluck('product_id')->unique()->filter()->toArray();
        $productsMap = Product::with(['category', 'brand', 'tax'])
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        // 4. Initialize Line Items
        $processedItems = [];
        $appliedPromotions = [];
        $rawSubtotal = 0.0;

        foreach ($rawItems as $index => $item) {
            $productId = (int) ($item['product_id'] ?? 0);
            $product   = $productsMap[$productId] ?? null;
            if (!$product) {
                continue;
            }

            $variantId = !empty($item['product_variant_id']) ? (int) $item['product_variant_id'] : null;
            $quantity  = max(0.0001, (float) ($item['quantity'] ?? $item['qty'] ?? 1));
            $basePrice = isset($item['unit_price']) && (float) $item['unit_price'] > 0
                ? (float) $item['unit_price']
                : (float) ($product->selling_price ?? $product->price ?? 0);

            $lineSubtotal = round($basePrice * $quantity, 2);
            $rawSubtotal += $lineSubtotal;

            $processedItems[$index] = [
                'item_index'         => $index,
                'product_id'         => $product->id,
                'product_variant_id' => $variantId,
                'product_name'       => $product->name,
                'sku'                => $product->sku ?? ('SKU-' . $product->id),
                'quantity'           => $quantity,
                'unit_price'         => $basePrice,        // Original base catalog price snapshot
                'cost_price'         => (float) ($product->cost_price ?? 0),
                'discount_amount'    => 0.0,
                'discount_percent'   => 0.0,
                'discount_type'      => null,
                'promotion_id'       => null,
                'promotion_rule_id'  => null,
                'final_unit_price'   => $basePrice,
                'subtotal'           => $lineSubtotal,
                'tax_percent'        => (float) ($item['tax_percent'] ?? ($product->tax?->rate ?? $taxRate)),
                'tax_amount'         => 0.0,
                'total'              => $lineSubtotal,
                'is_locked'          => false,             // When a non-stackable promotion applies
                'product_model'      => $product,
            ];
        }

        // 5. Evaluate Line-Item Level Promotion Rules (Product, Category, Brand, BOGO)
        // Group all rules from eligible campaigns, ordered by campaign.priority DESC, rule.priority DESC
        $lineRules = [];
        foreach ($campaigns as $campaign) {
            foreach ($campaign->rules as $rule) {
                if (!$rule->is_active) {
                    continue;
                }
                if (in_array($rule->rule_type, ['product_discount', 'category_discount', 'brand_discount', 'buy_x_get_y', 'bundle_discount'], true)) {
                    $lineRules[] = [
                        'campaign' => $campaign,
                        'rule'     => $rule,
                        'priority' => ($campaign->priority * 100) + $rule->priority,
                    ];
                }
            }
        }

        // Sort rules by combined priority DESC
        usort($lineRules, fn($a, $b) => $b['priority'] <=> $a['priority']);

        foreach ($lineRules as $itemRule) {
            $campaign = $itemRule['campaign'];
            $rule     = $itemRule['rule'];

            foreach ($processedItems as &$item) {
                if ($item['is_locked']) {
                    continue; // Skip if non-stackable promotion already locked this line
                }

                // Match Rule Target
                $isTargetMatch = false;
                $product = $item['product_model'];

                switch ($rule->rule_type) {
                    case 'product_discount':
                        $isTargetMatch = $rule->products->contains('id', $product->id);
                        break;

                    case 'category_discount':
                        $isTargetMatch = $product->category_id && $rule->categories->contains('id', $product->category_id);
                        break;

                    case 'brand_discount':
                        $isTargetMatch = $product->brand_id && $rule->brands->contains('id', $product->brand_id);
                        break;

                    case 'buy_x_get_y':
                        if ($rule->buyXGetY) {
                            $isTargetMatch = ($rule->buyXGetY->buy_product_id == $product->id);
                        }
                        break;
                }

                if (!$isTargetMatch) {
                    continue;
                }

                // Check Minimum / Maximum Quantity constraints
                if ($rule->min_qty !== null && $item['quantity'] < (float) $rule->min_qty) {
                    continue;
                }
                if ($rule->max_qty !== null && $item['quantity'] > (float) $rule->max_qty) {
                    continue;
                }

                // Calculate Line Discount Amount
                $lineBaseSubtotal = $item['unit_price'] * $item['quantity'];
                $calculatedDiscount = 0.0;
                $discType = $rule->discount_type;

                switch ($rule->discount_type) {
                    case 'percentage':
                        $calculatedDiscount = round($lineBaseSubtotal * ((float) $rule->discount_value / 100), 2);
                        break;

                    case 'fixed_amount':
                        $calculatedDiscount = round(min($lineBaseSubtotal, (float) $rule->discount_value * $item['quantity']), 2);
                        break;

                    case 'fixed_price':
                        $targetUnitPrice = (float) $rule->discount_value;
                        if ($targetUnitPrice < $item['unit_price']) {
                            $calculatedDiscount = round(($item['unit_price'] - $targetUnitPrice) * $item['quantity'], 2);
                        }
                        break;

                    case 'free_item':
                        $calculatedDiscount = $lineBaseSubtotal; // 100% OFF
                        break;
                }

                // Enforce Max Discount Cap per rule
                if ($rule->max_discount_amount !== null && $calculatedDiscount > (float) $rule->max_discount_amount) {
                    $calculatedDiscount = (float) $rule->max_discount_amount;
                }

                if ($calculatedDiscount > 0) {
                    // Check if this discount is higher or additional (based on stackable)
                    if ($item['discount_amount'] == 0 || $campaign->is_stackable) {
                        $item['discount_amount']  += $calculatedDiscount;
                        $item['discount_type']     = $discType;
                        $item['promotion_id']      = $campaign->id;
                        $item['promotion_rule_id'] = $rule->id;
                        $item['discount_percent']  = $lineBaseSubtotal > 0 ? round(($item['discount_amount'] / $lineBaseSubtotal) * 100, 2) : 0;
                        $item['final_unit_price']  = round(max(0, ($lineBaseSubtotal - $item['discount_amount']) / $item['quantity']), 2);

                        $appliedPromotions[] = [
                            'campaign_id'     => $campaign->id,
                            'campaign_name'   => $campaign->name,
                            'campaign_code'   => $campaign->code,
                            'rule_id'         => $rule->id,
                            'rule_name'       => $rule->name,
                            'rule_type'       => $rule->rule_type,
                            'product_id'      => $product->id,
                            'discount_amount' => $calculatedDiscount,
                        ];

                        // Lock line if campaign or rule is non-stackable
                        if (!$campaign->is_stackable || !$rule->is_stackable) {
                            $item['is_locked'] = true;
                        }
                    }
                }
            }
            unset($item);
        }

        // 6. Finalize Line Totals & Taxes
        $itemsTotalDiscount = 0.0;
        $itemsNetSubtotal   = 0.0;

        foreach ($processedItems as &$item) {
            $lineSubtotal = round($item['unit_price'] * $item['quantity'], 2);
            $afterDisc    = max(0.0, round($lineSubtotal - $item['discount_amount'], 2));
            $taxAmount    = round($afterDisc * ($item['tax_percent'] / 100), 2);
            $lineTotal    = round($afterDisc + $taxAmount, 2);

            $item['subtotal']   = $afterDisc;
            $item['tax_amount'] = $taxAmount;
            $item['total']      = $lineTotal;

            $itemsTotalDiscount += $item['discount_amount'];
            $itemsNetSubtotal   += $afterDisc;

            // Remove product model from output representation
            unset($item['product_model'], $item['is_locked'], $item['item_index']);
        }
        unset($item);

        // 7. Cart-Level Discount Rules (Order Subtotal Discounts)
        $cartDiscountAmount = 0.0;
        $cartRules = [];
        foreach ($campaigns as $campaign) {
            foreach ($campaign->rules as $rule) {
                if ($rule->is_active && $rule->rule_type === 'cart_discount') {
                    $cartRules[] = [
                        'campaign' => $campaign,
                        'rule'     => $rule,
                        'priority' => ($campaign->priority * 100) + $rule->priority,
                    ];
                }
            }
        }
        usort($cartRules, fn($a, $b) => $b['priority'] <=> $a['priority']);

        foreach ($cartRules as $cRule) {
            $campaign = $cRule['campaign'];
            $rule     = $cRule['rule'];

            if ($rule->min_subtotal !== null && $rawSubtotal < (float) $rule->min_subtotal) {
                continue;
            }
            if ($rule->max_subtotal !== null && $rawSubtotal > (float) $rule->max_subtotal) {
                continue;
            }

            $currentEligibleSubtotal = max(0.0, $itemsNetSubtotal - $cartDiscountAmount);
            if ($currentEligibleSubtotal <= 0) {
                break;
            }

            $discount = 0.0;
            if ($rule->discount_type === 'percentage') {
                $discount = round($currentEligibleSubtotal * ((float) $rule->discount_value / 100), 2);
            } else {
                $discount = min($currentEligibleSubtotal, (float) $rule->discount_value);
            }

            if ($rule->max_discount_amount !== null && $discount > (float) $rule->max_discount_amount) {
                $discount = (float) $rule->max_discount_amount;
            }

            if ($discount > 0) {
                $cartDiscountAmount += $discount;
                $appliedPromotions[] = [
                    'campaign_id'     => $campaign->id,
                    'campaign_name'   => $campaign->name,
                    'campaign_code'   => $campaign->code,
                    'rule_id'         => $rule->id,
                    'rule_name'       => $rule->name,
                    'rule_type'       => 'cart_discount',
                    'discount_amount' => $discount,
                ];

                if (!$campaign->is_stackable || !$rule->is_stackable) {
                    break; // Stop evaluating further cart discounts
                }
            }
        }

        // 8. Coupon Code Validation & Application
        $couponDiscountAmount = 0.0;
        $appliedCoupon = null;

        if ($couponCode) {
            $couponResult = $this->validateAndApplyCoupon($couponCode, $rawSubtotal, $customerId, $branchId);
            if ($couponResult['valid']) {
                $couponDiscountAmount = $couponResult['discount_amount'];
                $appliedCoupon = $couponResult['coupon'];

                $appliedPromotions[] = [
                    'campaign_id'     => $couponResult['campaign_id'] ?? null,
                    'campaign_name'   => 'Coupon Voucher: ' . $couponCode,
                    'campaign_code'   => $couponCode,
                    'rule_id'         => null,
                    'rule_name'       => 'Coupon Discount',
                    'rule_type'       => 'coupon_discount',
                    'discount_amount' => $couponDiscountAmount,
                ];
            }
        }

        // 9. Grand Total Calculations
        $totalDiscount = round($itemsTotalDiscount + $cartDiscountAmount + $couponDiscountAmount, 2);
        $finalTax      = round(collect($processedItems)->sum('tax_amount'), 2);
        $grandTotal    = max(0.0, round($rawSubtotal - $totalDiscount + $finalTax, 2));

        return [
            'success'            => true,
            'summary'            => [
                'subtotal'               => round($rawSubtotal, 2),
                'items_discount'         => round($itemsTotalDiscount, 2),
                'cart_discount'          => round($cartDiscountAmount, 2),
                'coupon_discount'        => round($couponDiscountAmount, 2),
                'total_discount'         => round($totalDiscount, 2),
                'tax_amount'             => round($finalTax, 2),
                'grand_total'            => round($grandTotal, 2),
                'applied_promotions_cnt' => count($appliedPromotions),
            ],
            'items'              => array_values($processedItems),
            'applied_promotions' => $appliedPromotions,
            'coupon_applied'     => $appliedCoupon ? [
                'id'              => $appliedCoupon->id,
                'code'            => $appliedCoupon->code,
                'discount_amount' => $couponDiscountAmount,
            ] : null,
        ];
    }

    /**
     * Resolve eligible active campaigns adhering to company, branch, channel, customer, and date scopes.
     */
    public function getEligibleCampaigns(
        int $companyId,
        int $branchId,
        string $channel,
        ?int $customerId = null,
        ?int $customerGroupId = null
    ): Collection {
        return PromotionCampaign::where('company_id', $companyId)
            ->active()
            ->forBranch($branchId)
            ->forChannel($channel)
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                  ->orWhereColumn('usage_count', '<', 'usage_limit');
            })
            ->where(function ($q) use ($customerId, $customerGroupId) {
                // If campaign has no specific customer groups and no specific customers, it is OPEN to everyone
                $q->where(function ($sub) {
                    $sub->whereDoesntHave('customerGroups')
                        ->whereDoesntHave('customers');
                });

                // Or customer matches specific group
                if ($customerGroupId) {
                    $q->orWhereHas('customerGroups', function ($gQuery) use ($customerGroupId) {
                        $gQuery->where('customer_groups.id', $customerGroupId);
                    });
                }

                // Or customer is explicitly assigned
                if ($customerId) {
                    $q->orWhereHas('customers', function ($cQuery) use ($customerId) {
                        $cQuery->where('customers.id', $customerId);
                    });
                }
            })
            ->with([
                'rules' => fn($q) => $q->where('is_active', true)->orderBy('priority', 'desc'),
                'rules.products',
                'rules.categories',
                'rules.brands',
                'rules.buyXGetY',
                'rules.bundles.items',
            ])
            ->orderBy('priority', 'desc')
            ->get();
    }

    /**
     * Validate and calculate discount for a coupon code.
     */
    public function validateAndApplyCoupon(
        string $code,
        float $subtotal,
        ?int $customerId = null,
        ?int $branchId = null
    ): array {
        $coupon = PromotionCoupon::where('code', $code)
            ->with(['campaign.rules', 'campaign.branches'])
            ->first();

        if (!$coupon) {
            return [
                'valid'           => false,
                'message'         => 'Coupon code is invalid or does not exist.',
                'discount_amount' => 0.0,
                'coupon'          => null,
            ];
        }

        if (!$coupon->isValidForCustomer($customerId)) {
            return [
                'valid'           => false,
                'message'         => 'Coupon has expired, is inactive, or has reached its usage limit.',
                'discount_amount' => 0.0,
                'coupon'          => null,
            ];
        }

        $campaign = $coupon->campaign;
        if ($branchId && $campaign->branches()->exists()) {
            if (!$campaign->branches()->where('branches.id', $branchId)->exists()) {
                return [
                    'valid'           => false,
                    'message'         => 'This coupon is not valid at this store location.',
                    'discount_amount' => 0.0,
                    'coupon'          => null,
                ];
            }
        }

        // Calculate discount from coupon or its campaign rules
        $rule = $campaign->rules->where('rule_type', 'coupon_discount')->first()
            ?? $campaign->rules->first();

        $discount = 0.0;
        if ($rule) {
            if ($rule->min_subtotal !== null && $subtotal < (float) $rule->min_subtotal) {
                return [
                    'valid'           => false,
                    'message'         => 'Minimum purchase of $' . number_format($rule->min_subtotal, 2) . ' required for this coupon.',
                    'discount_amount' => 0.0,
                    'coupon'          => null,
                ];
            }

            if ($rule->discount_type === 'percentage') {
                $discount = round($subtotal * ((float) $rule->discount_value / 100), 2);
            } else {
                $discount = min($subtotal, (float) $rule->discount_value);
            }

            if ($rule->max_discount_amount !== null && $discount > (float) $rule->max_discount_amount) {
                $discount = (float) $rule->max_discount_amount;
            }
        } else {
            // Default 5% if no specific rule attached
            $discount = round($subtotal * 0.05, 2);
        }

        return [
            'valid'           => true,
            'message'         => 'Coupon applied successfully.',
            'discount_amount' => $discount,
            'coupon'          => $coupon,
            'campaign_id'     => $campaign->id,
        ];
    }

    /**
     * Record usage after successful checkout / sale.
     */
    public function recordUsage(
        int $campaignId,
        ?int $couponId,
        ?int $customerId,
        ?int $saleId,
        ?int $orderId,
        ?int $branchId,
        float $discountAmount
    ): PromotionUsage {
        $usage = PromotionUsage::create([
            'promotion_campaign_id' => $campaignId,
            'promotion_coupon_id'   => $couponId,
            'customer_id'           => $customerId,
            'sale_id'               => $saleId,
            'order_id'              => $orderId,
            'branch_id'             => $branchId,
            'discount_amount'       => $discountAmount,
            'used_at'               => now(),
        ]);

        PromotionCampaign::where('id', $campaignId)->increment('usage_count');

        if ($couponId) {
            PromotionCoupon::where('id', $couponId)->increment('used_count');
        }

        return $usage;
    }
}
