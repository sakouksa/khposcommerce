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
            $processedItems = [];
            $companyId = $data['company_id'] ?? 1;
            $warehouseId = $data['warehouse_id'] ?? 1;

            foreach ($itemsData as $item) {
                $product = Product::find($item['product_id']);
                if (!$product) {
                    continue;
                }

                $qty = (float) ($item['quantity'] ?? 1);
                $unitPrice = (float) ($item['unit_price'] ?? $product->selling_price ?? $product->price ?? 0);
                $lineSubtotal = round($unitPrice * $qty, 2);
                $subtotal += $lineSubtotal;

                $processedItems[] = [
                    'product_id'         => $product->id,
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'product_name'       => $product->name,
                    'product_sku'        => $item['product_sku'] ?? $product->sku ?? 'SKU',
                    'quantity'           => $qty,
                    'unit_price'         => $unitPrice,
                    'subtotal'           => $lineSubtotal,
                    'tax_amount'         => 0.0,
                    'discount_amount'    => 0.0,
                    'total'              => $lineSubtotal,
                ];
            }

            // Calculate coupon discount
            $discountAmount = 0.0;
            $couponCode = $data['coupon_code'] ?? null;
            if ($couponCode) {
                $couponResult = $this->pricingService->validateCoupon($couponCode, $subtotal, $customerId);
                if ($couponResult['valid']) {
                    $discountAmount = $couponResult['discount_amount'] ?? $couponResult['discount'] ?? 0.0;
                    $couponResult['coupon']?->increment('used_count');
                }
            }

            $shippingCost = (float) ($data['shipping_cost'] ?? 0.0);
            $taxAmount = (float) ($data['tax_amount'] ?? 0.0);
            $grandTotal = max(0.0, round($subtotal - $discountAmount + $shippingCost + $taxAmount, 2));

            $orderNumber = 'ORD-' . strtoupper(Str::random(4)) . '-' . date('YmdHis');

            $order = Order::create([
                'company_id'            => $companyId,
                'store_id'              => $data['store_id'] ?? null,
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

            // Save items & log inventory
            foreach ($processedItems as $pItem) {
                $order->items()->create($pItem);
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
