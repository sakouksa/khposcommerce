<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Order\Cart;
use App\Models\Order\CartItem;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;
use App\Models\Marketing\Coupon;
use App\Models\Customer\Customer;
use App\Models\Shipping\ShippingMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartController extends BaseApiController
{
    // ─── GET /api/v1/carts ───────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $carts = Cart::with(['customer', 'items.product', 'items.variant'])
            ->latest()
            ->paginate($perPage);

        return $this->paginatedResponse($carts, 'Carts retrieved successfully');
    }

    // ─── GET /api/v1/store/cart ───────────────────────────────────────────────

    public function show(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);

        if (!$cart) {
            return $this->successResponse($this->emptyCartResponse());
        }

        $cart->load(['items.product.primaryImage', 'items.variant']);

        return $this->successResponse($this->formatCart($cart));
    }

    // ─── POST /api/v1/store/cart/add ────────────────────────────────────────

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id'         => 'required|integer|exists:products,id',
            'product_variant_id' => 'nullable|integer|exists:product_variants,id',
            'quantity'           => 'required|numeric|min:0.001',
        ]);

        $product = Product::active()->findOrFail($validated['product_id']);

        // Stock check
        if ($product->track_inventory) {
            $stock = $this->getAvailableStock($product->id, $validated['product_variant_id'] ?? null);
            if ($stock < $validated['quantity']) {
                return $this->errorResponse("Insufficient stock. Only {$stock} units available.", null, 422);
            }
        }

        $cart = $this->resolveOrCreateCart($request);

        DB::transaction(function () use ($cart, $validated) {
            $item = $cart->items()
                ->where('product_id', $validated['product_id'])
                ->where('product_variant_id', $validated['product_variant_id'] ?? null)
                ->first();

            if ($item) {
                $item->increment('quantity', $validated['quantity']);
            } else {
                $cart->items()->create([
                    'product_id'         => $validated['product_id'],
                    'product_variant_id' => $validated['product_variant_id'] ?? null,
                    'quantity'           => $validated['quantity'],
                ]);
            }
        });

        $cart->load(['items.product.primaryImage', 'items.variant']);

        return $this->successResponse($this->formatCart($cart), 'Item added to cart');
    }

    // ─── PUT /api/v1/store/cart/update ─────────────────────────────────────

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items'            => 'required|array',
            'items.*.item_id'  => 'required|integer',
            'items.*.quantity' => 'required|numeric|min:0',
        ]);

        $cart = $this->resolveCart($request);
        if (!$cart) {
            return $this->errorResponse('Cart not found', null, 404);
        }

        DB::transaction(function () use ($cart, $validated) {
            foreach ($validated['items'] as $itemData) {
                $item = $cart->items()->find($itemData['item_id']);
                if (!$item) {
                    continue;
                }

                if ($itemData['quantity'] <= 0) {
                    $item->delete();
                } else {
                    // Stock check
                    $product = $item->product;
                    if ($product && $product->track_inventory) {
                        $stock = $this->getAvailableStock($product->id, $item->product_variant_id);
                        if ($stock < $itemData['quantity']) {
                            $item->update(['quantity' => $stock]);
                            continue;
                        }
                    }
                    $item->update(['quantity' => $itemData['quantity']]);
                }
            }
        });

        $cart->load(['items.product.primaryImage', 'items.variant']);

        return $this->successResponse($this->formatCart($cart), 'Cart updated');
    }

    // ─── DELETE /api/v1/store/cart/remove ─────────────────────────────────

    public function remove(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_id' => 'required|integer',
        ]);

        $cart = $this->resolveCart($request);
        if (!$cart) {
            return $this->errorResponse('Cart not found', null, 404);
        }

        $cart->items()->where('id', $validated['item_id'])->delete();
        $cart->load(['items.product.primaryImage', 'items.variant']);

        return $this->successResponse($this->formatCart($cart), 'Item removed from cart');
    }

    // ─── DELETE /api/v1/store/cart/clear ─────────────────────────────────

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        if ($cart) {
            $cart->items()->delete();
        }

        return $this->successResponse($this->emptyCartResponse(), 'Cart cleared');
    }

    // ─── POST /api/v1/store/cart/apply-coupon ────────────────────────────

    public function applyCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $coupon = Coupon::active()->where('code', strtoupper($validated['code']))->first();

        if (!$coupon) {
            return $this->errorResponse('Invalid or expired coupon code', null, 422);
        }

        $cart = $this->resolveCart($request);
        if (!$cart || $cart->items()->count() === 0) {
            return $this->errorResponse('Your cart is empty', null, 422);
        }

        $subtotal = $this->calculateSubtotal($cart);

        if ($coupon->min_purchase && $subtotal < $coupon->min_purchase) {
            return $this->errorResponse(
                "Minimum purchase of {$coupon->min_purchase} required for this coupon",
                null,
                422
            );
        }

        // Calculate discount
        $discount = match ($coupon->type) {
            'percentage' => min(
                $subtotal * ($coupon->value / 100),
                $coupon->max_discount ?? PHP_FLOAT_MAX
            ),
            'fixed'      => min($coupon->value, $subtotal),
            default      => 0,
        };

        return $this->successResponse([
            'coupon'   => [
                'code'  => $coupon->code,
                'name'  => $coupon->name,
                'type'  => $coupon->type,
                'value' => (float) $coupon->value,
            ],
            'discount' => round($discount, 2),
            'subtotal' => round($subtotal, 2),
            'total'    => round($subtotal - $discount, 2),
        ], 'Coupon applied successfully');
    }

    // ─── POST /api/v1/store/cart/checkout ────────────────────────────────

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_name'      => 'required|string|max:191',
            'shipping_phone'     => 'required|string|max:50',
            'shipping_address'   => 'required|string',
            'shipping_city'      => 'required|string|max:100',
            'shipping_province'  => 'nullable|string|max:100',
            'shipping_country'   => 'required|string|max:100',
            'shipping_postal_code' => 'nullable|string|max:20',
            'shipping_method_id' => 'nullable|integer|exists:shipping_methods,id',
            'coupon_code'        => 'nullable|string',
            'payment_method'     => 'required|string',
            'customer_notes'     => 'nullable|string|max:1000',
            'currency_code'      => 'nullable|string|max:10',
        ]);

        $cart = $this->resolveCart($request);

        if (!$cart || $cart->items()->count() === 0) {
            return $this->errorResponse('Your cart is empty', null, 422);
        }

        $cart->load(['items.product', 'items.variant']);

        // Validate stock for all items
        foreach ($cart->items as $item) {
            if ($item->product && $item->product->track_inventory) {
                $stock = $this->getAvailableStock($item->product_id, $item->product_variant_id);
                if ($stock < $item->quantity) {
                    return $this->errorResponse(
                        "Insufficient stock for product: {$item->product->name}",
                        null,
                        422
                    );
                }
            }
        }

        $subtotal   = $this->calculateSubtotal($cart);
        $discount   = 0;
        $couponCode = null;

        // Apply coupon if provided
        if (!empty($validated['coupon_code'])) {
            $coupon = Coupon::active()->where('code', strtoupper($validated['coupon_code']))->first();
            if ($coupon) {
                $discount   = match ($coupon->type) {
                    'percentage' => min(
                        $subtotal * ($coupon->value / 100),
                        $coupon->max_discount ?? PHP_FLOAT_MAX
                    ),
                    'fixed'      => min($coupon->value, $subtotal),
                    default      => 0,
                };
                $couponCode = $coupon->code;
            }
        }

        // Shipping cost
        $shippingCost = 0;
        if (!empty($validated['shipping_method_id'])) {
            $shippingMethod = ShippingMethod::find($validated['shipping_method_id']);
            $shippingCost   = $shippingMethod ? (float) ($shippingMethod->base_price ?? $shippingMethod->base_cost ?? 0) : 0;
        }

        $grandTotal = max(0, $subtotal - $discount + $shippingCost);

        // Get or resolve customer
        $customerId = null;
        if ($request->user()) {
            $customer   = Customer::where('user_id', $request->user()->id)->first();
            $customerId = $customer?->id;
        }

        $order = DB::transaction(function () use (
            $cart, $validated, $subtotal, $discount, $shippingCost,
            $grandTotal, $couponCode, $customerId
        ) {
            $order = Order::create([
                'customer_id'          => $customerId,
                'order_number'         => 'ORD-' . strtoupper(Str::random(10)),
                'status'               => 'pending',
                'payment_status'       => 'unpaid',
                'fulfillment_status'   => 'unfulfilled',
                'shipping_name'        => $validated['shipping_name'],
                'shipping_phone'       => $validated['shipping_phone'],
                'shipping_address'     => $validated['shipping_address'],
                'shipping_city'        => $validated['shipping_city'],
                'shipping_province'    => $validated['shipping_province'] ?? null,
                'shipping_country'     => $validated['shipping_country'],
                'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
                'shipping_method_id'   => $validated['shipping_method_id'] ?? null,
                'shipping_cost'        => $shippingCost,
                'subtotal'             => $subtotal,
                'discount_amount'      => $discount,
                'tax_amount'           => 0,
                'grand_total'          => $grandTotal,
                'coupon_code'          => $couponCode,
                'currency_code'        => $validated['currency_code'] ?? 'USD',
                'customer_notes'       => $validated['customer_notes'] ?? null,
            ]);

            // Create order items from cart items
            foreach ($cart->items as $cartItem) {
                $price = $cartItem->variant
                    ? (float) $cartItem->variant->selling_price
                    : (float) $cartItem->product->selling_price;

                $itemTotal = $price * $cartItem->quantity;
                $order->items()->create([
                    'product_id'         => $cartItem->product_id,
                    'product_variant_id' => $cartItem->product_variant_id,
                    'product_name'       => $cartItem->product->name,
                    'product_sku'        => $cartItem->variant?->sku ?? $cartItem->product->sku,
                    'quantity'           => $cartItem->quantity,
                    'unit_price'         => $price,
                    'subtotal'           => $itemTotal,
                    'total'              => $itemTotal,
                ]);
            }

            // Add initial status history
            $order->statusHistories()->create([
                'status'          => 'pending',
                'comment'         => 'Order placed by customer',
                'notify_customer' => true,
            ]);

            // Clear cart
            $cart->items()->delete();

            return $order;
        });

        return $this->successResponse([
            'order_number' => $order->order_number,
            'order_id'     => $order->id,
            'grand_total'  => (float) $order->grand_total,
            'status'       => $order->status,
        ], 'Order placed successfully', 201);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private function resolveCart(Request $request): ?Cart
    {
        if ($request->user()) {
            $customer = Customer::where('user_id', $request->user()->id)->first();
            if ($customer) {
                return Cart::where('customer_id', $customer->id)->latest()->first();
            }
        }

        $sessionId = $request->header('X-Session-ID') ?? $request->input('session_id');
        if ($sessionId) {
            return Cart::where('session_id', $sessionId)->latest()->first();
        }

        return null;
    }

    private function resolveOrCreateCart(Request $request): Cart
    {
        $storeId = (int) ($request->input('store_id') ?? \App\Models\Company\Store::value('id') ?? 1);

        if ($request->user()) {
            $customer = Customer::where('user_id', $request->user()->id)->first();
            if ($customer) {
                return Cart::firstOrCreate([
                    'store_id'    => $storeId,
                    'customer_id' => $customer->id,
                ]);
            }
        }

        $sessionId = $request->header('X-Session-ID') ?? $request->input('session_id') ?? Str::uuid()->toString();
        return Cart::firstOrCreate([
            'store_id'   => $storeId,
            'session_id' => $sessionId,
        ]);
    }

    private function calculateSubtotal(Cart $cart): float
    {
        return (float) $cart->items->reduce(function ($carry, $item) {
            $price = $item->variant
                ? (float) $item->variant->selling_price
                : (float) $item->product?->selling_price ?? 0;

            return $carry + ($price * $item->quantity);
        }, 0);
    }

    private function getAvailableStock(int $productId, ?int $variantId): float
    {
        return (float) DB::table('inventories')
            ->where('product_id', $productId)
            ->where(function ($q) use ($variantId) {
                if ($variantId) {
                    $q->where('product_variant_id', $variantId);
                }
            })
            ->sum('quantity');
    }

    private function emptyCartResponse(): array
    {
        return [
            'items'      => [],
            'item_count' => 0,
            'subtotal'   => 0,
            'total'      => 0,
        ];
    }

    private function formatCart(Cart $cart): array
    {
        $subtotal = $this->calculateSubtotal($cart);

        return [
            'id'         => $cart->id,
            'items'      => $cart->items->map(fn($item) => [
                'id'                 => $item->id,
                'product_id'         => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'quantity'           => (float) $item->quantity,
                'product'            => $item->product ? [
                    'id'            => $item->product->id,
                    'name'          => $item->product->name,
                    'sku'           => $item->product->sku,
                    'selling_price' => (float) $item->product->selling_price,
                    'compare_price' => (float) $item->product->compare_price,
                    'image'         => $item->product->primaryImage?->url,
                ] : null,
                'variant'            => $item->variant ? [
                    'id'            => $item->variant->id,
                    'name'          => $item->variant->name,
                    'sku'           => $item->variant->sku,
                    'selling_price' => (float) $item->variant->selling_price,
                ] : null,
                'line_total'         => round(
                    (float) ($item->variant?->selling_price ?? $item->product?->selling_price ?? 0) * $item->quantity,
                    2
                ),
            ])->values(),
            'item_count' => $cart->items->count(),
            'subtotal'   => round($subtotal, 2),
            'total'      => round($subtotal, 2),
        ];
    }
}
