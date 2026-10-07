<?php

namespace App\Services\Order\Actions;

use App\Services\Inventory\InventoryService;
use App\Services\Sales\PricingService;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\Cart;
use App\Models\Order\CartItem;
use App\Models\Product\Product;
use App\Models\Customer\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class CheckoutAction
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly PricingService $pricingService
    ) {
    }

    /**
     * Execute customer e-commerce checkout.
     */
    public function execute(array $data, ?int $userId = null, ?int $customerId = null): Order
    {
        return DB::transaction(function () use ($data, $userId, $customerId) {
            $user = auth()->user();
            $userId = $userId ?: $user?->id;

            if (!$customerId && $userId) {
                $customer = Customer::where('user_id', $userId)->first();
                $customerId = $customer?->id;
            }

            // Get items either directly or from customer cart
            $itemsData = $data['items'] ?? [];
            if (empty($itemsData) && $userId) {
                $cart = Cart::where('user_id', $userId)->with('items.product')->first();
                if ($cart && $cart->items->isNotEmpty()) {
                    foreach ($cart->items as $cItem) {
                        $itemsData[] = [
                            'product_id'         => $cItem->product_id,
                            'product_variant_id' => $cItem->product_variant_id,
                            'quantity'           => $cItem->quantity,
                            'unit_price'         => $cItem->product?->price ?? 0,
                        ];
                    }
                }
            }

            if (empty($itemsData)) {
                throw new Exception('Cart is empty. Cannot proceed with checkout.');
            }

            $subtotal = 0.0;
            $companyId   = (int) ($data['company_id'] ?? 1);
            $warehouseId = (int) ($data['warehouse_id'] ?? 1);
            $storeId     = !empty($data['store_id']) ? (int) $data['store_id'] : null;
            $couponCode  = $data['coupon_code'] ?? null;

            // Resolve branch from store or warehouse
            $branchId = (int) (DB::table('stores')->where('id', $storeId)->value('branch_id') 
                ?? DB::table('warehouses')->where('id', $warehouseId)->value('branch_id')
                ?? 1);

            // Execute Central Pricing Engine (channel = 'web')
            $pricingEngine = app(\App\Services\Sales\PricingEngineService::class);
            $pricingResult = $pricingEngine->calculate([
                'company_id'  => $companyId,
                'branch_id'   => $branchId,
                'channel'     => 'web',
                'customer_id' => $customerId,
                'items'       => $itemsData,
                'coupon_code' => $couponCode,
                'tax_rate'    => 0.0,
            ]);

            $subtotal       = $pricingResult['summary']['subtotal'];
            $discountAmount = $pricingResult['summary']['total_discount'];
            $shippingCost   = (float) ($data['shipping_cost'] ?? 0.0);
            $taxAmount      = (float) ($data['tax_amount'] ?? $pricingResult['summary']['tax_amount'] ?? 0.0);
            $grandTotal     = max(0.0, round($subtotal - $discountAmount + $shippingCost + $taxAmount, 2));

            $orderNumber = 'ORD-' . strtoupper(Str::random(4)) . '-' . date('YmdHis');

            $order = Order::create([
                'company_id'            => $companyId,
                'store_id'              => $storeId,
                'warehouse_id'          => $warehouseId,
                'customer_id'           => $customerId,
                'order_number'          => $orderNumber,
                'status'                => 'pending',
                'payment_status'        => $data['payment_status'] ?? 'unpaid',
                'fulfillment_status'    => 'unfulfilled',
                'shipping_name'         => $data['shipping_name'] ?? $data['name'] ?? $user?->name ?? 'Guest Customer',
                'shipping_phone'        => $data['shipping_phone'] ?? $data['phone'] ?? $user?->phone ?? '',
                'shipping_address'      => $data['shipping_address'] ?? $data['address'] ?? '',
                'shipping_city'         => $data['shipping_city'] ?? $data['city'] ?? '',
                'shipping_province'     => $data['shipping_province'] ?? $data['province'] ?? '',
                'shipping_country'      => $data['shipping_country'] ?? $data['country'] ?? 'Cambodia',
                'shipping_postal_code'  => $data['shipping_postal_code'] ?? $data['postal_code'] ?? null,
                'shipping_method_id'    => $data['shipping_method_id'] ?? null,
                'shipping_cost'         => $shippingCost,
                'subtotal'              => $subtotal,
                'tax_amount'            => $taxAmount,
                'discount_amount'       => $discountAmount,
                'grand_total'           => $grandTotal,
                'paid_amount'           => 0.0,
                'coupon_code'           => $couponCode,
                'currency_code'         => $data['currency_code'] ?? 'USD',
                'exchange_rate'         => $data['exchange_rate'] ?? 1.0,
                'customer_notes'        => $data['notes'] ?? $data['customer_notes'] ?? null,
            ]);

            // Save items with snapshot fields & log inventory
            foreach ($pricingResult['items'] as $pItem) {
                $order->items()->create([
                    'product_id'         => $pItem['product_id'],
                    'product_variant_id' => $pItem['product_variant_id'] ?? null,
                    'product_name'       => $pItem['product_name'],
                    'product_sku'        => $pItem['sku'] ?? 'SKU',
                    'product_image'      => null,
                    'quantity'           => $pItem['quantity'],
                    'unit_price'         => $pItem['unit_price'],
                    'discount_amount'    => $pItem['discount_amount'] ?? 0.0,
                    'discount_type'      => $pItem['discount_type'] ?? null,
                    'promotion_id'       => $pItem['promotion_id'] ?? null,
                    'promotion_rule_id'  => $pItem['promotion_rule_id'] ?? null,
                    'final_unit_price'   => $pItem['final_unit_price'] ?? $pItem['unit_price'],
                    'tax_amount'         => $pItem['tax_amount'] ?? 0.0,
                    'subtotal'           => $pItem['subtotal'],
                    'total'              => $pItem['total'],
                ]);
            }

            // Record promotion usages
            if (!empty($pricingResult['applied_promotions'])) {
                foreach ($pricingResult['applied_promotions'] as $promo) {
                    if (!empty($promo['campaign_id'])) {
                        \App\Models\Marketing\PromotionUsage::create([
                            'promotion_campaign_id' => (int) $promo['campaign_id'],
                            'promotion_coupon_id'   => !empty($pricingResult['coupon_applied']['id']) ? (int) $pricingResult['coupon_applied']['id'] : null,
                            'customer_id'           => $customerId,
                            'sale_id'               => null,
                            'order_id'              => $order->id,
                            'branch_id'             => $branchId,
                            'discount_amount'       => (float) ($promo['discount_amount'] ?? 0),
                            'used_at'               => now(),
                        ]);
                        \App\Models\Marketing\PromotionCampaign::where('id', $promo['campaign_id'])->increment('usage_count');
                    }
                }
            }

            if (!empty($pricingResult['coupon_applied']['id'])) {
                \App\Models\Marketing\PromotionCoupon::where('id', $pricingResult['coupon_applied']['id'])->increment('used_count');
            }

            // Log initial status
            $order->addStatusHistory('pending', 'Order placed successfully by customer.', true);

            // Clear user cart if authenticated
            if ($userId) {
                $cart = Cart::where('user_id', $userId)->first();
                if ($cart) {
                    CartItem::where('cart_id', $cart->id)->delete();
                }
            }

            return $order->load(['items.product', 'customer']);
        });
    }
}
