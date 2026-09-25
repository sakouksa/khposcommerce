<?php

namespace App\Services\Chatbot\Tools;

use App\Models\Order\Cart;
use App\Models\Order\CartItem;
use App\Models\Product\Product;
use App\Models\Customer\Customer;
use App\Models\Company\Store;
use Illuminate\Support\Facades\DB;

class CartTool
{
    /**
     * Resolve existing cart or create a new one for current customer/session.
     */
    public function resolveCart(array $context): Cart
    {
        $store = Store::first();
        if (!$store) {
            $company = \App\Models\Company\Company::first() ?? \App\Models\Company\Company::create([
                'name' => 'Default Company',
                'slug' => 'default-company',
                'is_active' => true,
            ]);
            $branch = \App\Models\Company\Branch::first() ?? \App\Models\Company\Branch::create([
                'company_id' => $company->id,
                'name'       => 'Default Branch',
                'code'       => 'DEF-BR',
                'is_active'  => true,
            ]);
            $store = Store::create([
                'company_id' => $company->id,
                'branch_id'  => $branch->id,
                'name'       => 'Default Store',
                'code'       => 'DEF-STORE',
                'slug'       => 'default-store',
                'is_active'  => true,
            ]);
        }

        $storeId = $store->id;
        $customerId = $context['customer_id'] ?? null;
        $sessionToken = $context['session_token'] ?? $context['session_id'] ?? 'guest';

        if ($customerId) {
            $cart = Cart::where('customer_id', $customerId)->latest()->first();
            if ($cart) return $cart;

            return Cart::create([
                'store_id'      => $storeId,
                'customer_id'   => $customerId,
                'currency_code' => $context['currency'] ?? 'USD',
            ]);
        }

        $cart = Cart::where('session_id', $sessionToken)->latest()->first();
        if ($cart) return $cart;

        return Cart::create([
            'store_id'      => $storeId,
            'session_id'    => $sessionToken,
            'currency_code' => $context['currency'] ?? 'USD',
        ]);
    }

    /**
     * Get current cart contents.
     */
    public function getCart(array $params, array $context): array
    {
        $cart = $this->resolveCart($context);
        $cart->load(['items.product.primaryImage', 'items.variant']);

        $res = $this->formatCartResponse($cart);
        $res['cart'] = $res;
        return $res;
    }

    /**
     * Add product to cart.
     */
    public function addToCart(array $params, array $context): array
    {
        $productId = $params['product_id'] ?? null;
        $identifier = $params['product_identifier'] ?? $params['identifier'] ?? $productId;
        $variantId = $params['product_variant_id'] ?? null;
        $quantity = max(1, (float) ($params['quantity'] ?? 1));

        $product = null;
        if (is_numeric($identifier)) {
            $product = Product::active()->find($identifier);
        }

        if (!$product && !empty($identifier)) {
            $product = Product::active()
                ->where(function ($q) use ($identifier) {
                    $q->where('sku', $identifier)
                      ->orWhere('slug', $identifier)
                      ->orWhere('name', 'like', "%{$identifier}%");
                })
                ->first();
        }

        if (!$product) {
            return [
                'success' => false,
                'message' => 'Product not found or unavailable.',
            ];
        }

        // Validate stock
        if ($product->track_inventory) {
            $stock = (float) $product->stock;
            if ($stock < $quantity) {
                return [
                    'success' => false,
                    'message' => "Insufficient stock. Only {$stock} units available for {$product->name}.",
                ];
            }
        }

        $cart = $this->resolveCart($context);

        DB::transaction(function () use ($cart, $product, $variantId, $quantity) {
            $item = $cart->items()
                ->where('product_id', $product->id)
                ->where('product_variant_id', $variantId)
                ->first();

            $price = (float) $product->selling_price;

            if ($item) {
                $item->increment('quantity', $quantity);
            } else {
                $cart->items()->create([
                    'product_id'         => $product->id,
                    'product_variant_id' => $variantId,
                    'quantity'           => $quantity,
                    'unit_price'         => $price,
                ]);
            }
        });

        $cart->load(['items.product.primaryImage', 'items.variant']);

        $res = $this->formatCartResponse($cart);
        $res['success'] = true;
        $res['cart'] = $res;
        $res['added_product'] = [
            'id'       => $product->id,
            'name'     => $product->name,
            'quantity' => $quantity,
            'price'    => (float) $product->selling_price,
        ];
        $res['message'] = "Added {$quantity}x {$product->name} to cart.";

        return $res;
    }

    /**
     * Remove item from cart.
     */
    public function removeFromCart(array $params, array $context): array
    {
        $cart = $this->resolveCart($context);
        $productId = $params['product_id'] ?? null;
        $itemId = $params['cart_item_id'] ?? null;

        $deleted = false;
        if ($itemId) {
            $deleted = $cart->items()->where('id', $itemId)->delete() > 0;
        } elseif ($productId) {
            $deleted = $cart->items()->where('product_id', $productId)->delete() > 0;
        }

        $cart->load(['items.product.primaryImage', 'items.variant']);
        $res = $this->formatCartResponse($cart);
        $res['success'] = $deleted;
        $res['message'] = $deleted ? 'Item removed from cart.' : 'Item not found in cart.';
        return $res;
    }

    /**
     * Update quantity of an item.
     */
    public function updateCartQuantity(array $params, array $context): array
    {
        $cart = $this->resolveCart($context);
        $productId = $params['product_id'] ?? null;
        $itemId = $params['cart_item_id'] ?? null;
        $quantity = (float) ($params['quantity'] ?? 1);

        $item = null;
        if ($itemId) {
            $item = $cart->items()->find($itemId);
        } elseif ($productId) {
            $item = $cart->items()->where('product_id', $productId)->first();
        }

        if (!$item) {
            return ['success' => false, 'message' => 'Item not found in cart.'];
        }

        if ($quantity <= 0) {
            $item->delete();
        } else {
            $item->update(['quantity' => $quantity]);
        }

        $cart->load(['items.product.primaryImage', 'items.variant']);
        $res = $this->formatCartResponse($cart);
        $res['success'] = true;
        $res['message'] = 'Cart quantity updated.';
        return $res;
    }

    /**
     * Clear the whole cart.
     */
    public function clearCart(array $params, array $context): array
    {
        $cart = $this->resolveCart($context);
        $cart->items()->delete();

        return [
            'success'    => true,
            'message'    => 'Cart cleared successfully.',
            'items'      => [],
            'subtotal'   => 0,
            'total'      => 0,
            'item_count' => 0,
        ];
    }

    private function formatCartResponse(Cart $cart): array
    {
        $items = $cart->items->map(function (CartItem $item) {
            $product = $item->product;
            $price = $item->variant ? (float) $item->variant->selling_price : (float) $product->selling_price;
            $subtotal = $price * (float) $item->quantity;

            return [
                'id'                 => $item->id,
                'product_id'         => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'name'               => $product->name,
                'variant_name'       => $item->variant?->name,
                'price'              => $price,
                'quantity'           => (float) $item->quantity,
                'subtotal'           => $subtotal,
                'image_url'          => $product->primaryImage?->url,
            ];
        });

        $subtotal = (float) $items->sum('subtotal');
        $itemCount = (int) $items->sum('quantity');

        return [
            'cart_id'    => $cart->id,
            'items'      => $items->toArray(),
            'item_count' => $itemCount,
            'subtotal'   => $subtotal,
            'total'      => $subtotal,
            'currency'   => $cart->currency_code ?? 'USD',
        ];
    }
}
