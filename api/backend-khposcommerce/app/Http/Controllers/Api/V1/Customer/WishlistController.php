<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Order\Wishlist;
use App\Models\Order\Cart;
use App\Models\Order\CartItem;
use App\Models\Customer\Customer;
use App\Models\Product\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WishlistController extends BaseApiController
{
    // ─── GET /api/v1/customer/wishlist ───────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $customer = $this->getAuthenticatedCustomer($request);
        if (!$customer) {
            return $this->errorResponse('Customer account not found', null, 404);
        }

        $wishlist = Wishlist::where('customer_id', $customer->id)
            ->with(['product.primaryImage', 'product.category', 'product.brand'])
            ->get()
            ->map(fn($w) => $this->formatWishlistItem($w));

        return $this->successResponse($wishlist);
    }

    // ─── POST /api/v1/customer/wishlist/add ──────────────────────────────────

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $customer = $this->getAuthenticatedCustomer($request);
        if (!$customer) {
            return $this->errorResponse('Customer account not found', null, 404);
        }

        $product = Product::active()->find($validated['product_id']);
        if (!$product) {
            return $this->errorResponse('Product not available', null, 404);
        }

        $exists = Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $validated['product_id'])
            ->exists();

        if ($exists) {
            return $this->successResponse(null, 'Product is already in your wishlist');
        }

        Wishlist::create([
            'customer_id' => $customer->id,
            'product_id'  => $validated['product_id'],
        ]);

        $count = Wishlist::where('customer_id', $customer->id)->count();

        return $this->successResponse(['wishlist_count' => $count], 'Added to wishlist', 201);
    }

    // ─── DELETE /api/v1/customer/wishlist/{id} ───────────────────────────────

    public function remove(Request $request, int $id): JsonResponse
    {
        $customer = $this->getAuthenticatedCustomer($request);
        if (!$customer) {
            return $this->errorResponse('Customer account not found', null, 404);
        }

        $deleted = Wishlist::where('customer_id', $customer->id)
            ->where('id', $id)
            ->delete();

        if (!$deleted) {
            return $this->errorResponse('Wishlist item not found', null, 404);
        }

        $count = Wishlist::where('customer_id', $customer->id)->count();

        return $this->successResponse(['wishlist_count' => $count], 'Removed from wishlist');
    }

    // ─── DELETE /api/v1/customer/wishlist/product/{productId} ────────────────

    public function removeByProduct(Request $request, int $productId): JsonResponse
    {
        $customer = $this->getAuthenticatedCustomer($request);
        if (!$customer) {
            return $this->errorResponse('Customer account not found', null, 404);
        }

        Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $productId)
            ->delete();

        return $this->successResponse(null, 'Removed from wishlist');
    }

    // ─── POST /api/v1/customer/wishlist/{id}/move-to-cart ────────────────────

    public function moveToCart(Request $request, int $id): JsonResponse
    {
        $customer = $this->getAuthenticatedCustomer($request);
        if (!$customer) {
            return $this->errorResponse('Customer account not found', null, 404);
        }

        $wishlistItem = Wishlist::where('customer_id', $customer->id)
            ->where('id', $id)
            ->with('product')
            ->first();

        if (!$wishlistItem) {
            return $this->errorResponse('Wishlist item not found', null, 404);
        }

        DB::transaction(function () use ($customer, $wishlistItem) {
            // Find or create cart for customer
            $cart = Cart::firstOrCreate(['customer_id' => $customer->id]);

            // Add to cart (or increment if already there)
            $cartItem = $cart->items()
                ->where('product_id', $wishlistItem->product_id)
                ->whereNull('product_variant_id')
                ->first();

            if ($cartItem) {
                $cartItem->increment('quantity', 1);
            } else {
                $cart->items()->create([
                    'product_id' => $wishlistItem->product_id,
                    'quantity'   => 1,
                ]);
            }

            // Remove from wishlist
            $wishlistItem->delete();
        });

        return $this->successResponse(null, 'Moved to cart');
    }

    // ─── POST /api/v1/customer/wishlist/move-all-to-cart ──────────────────────

    public function moveAllToCart(Request $request): JsonResponse
    {
        $customer = $this->getAuthenticatedCustomer($request);
        if (!$customer) {
            return $this->errorResponse('Customer account not found', null, 404);
        }

        $wishlistItems = Wishlist::where('customer_id', $customer->id)->get();

        if ($wishlistItems->isEmpty()) {
            return $this->errorResponse('Wishlist is empty', null, 422);
        }

        DB::transaction(function () use ($customer, $wishlistItems) {
            $cart = Cart::firstOrCreate(['customer_id' => $customer->id]);

            foreach ($wishlistItems as $wishlistItem) {
                $cartItem = $cart->items()
                    ->where('product_id', $wishlistItem->product_id)
                    ->whereNull('product_variant_id')
                    ->first();

                if ($cartItem) {
                    $cartItem->increment('quantity', 1);
                } else {
                    $cart->items()->create([
                        'product_id' => $wishlistItem->product_id,
                        'quantity'   => 1,
                    ]);
                }
            }

            // Clear wishlist
            Wishlist::where('customer_id', $customer->id)->delete();
        });

        return $this->successResponse(null, 'All items moved to cart');
    }

    // ─── GET /api/v1/customer/wishlist/check/{productId} ─────────────────────

    public function check(Request $request, int $productId): JsonResponse
    {
        $customer = $this->getAuthenticatedCustomer($request);
        if (!$customer) {
            return $this->successResponse(['in_wishlist' => false]);
        }

        $inWishlist = Wishlist::where('customer_id', $customer->id)
            ->where('product_id', $productId)
            ->exists();

        return $this->successResponse(['in_wishlist' => $inWishlist]);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private function getAuthenticatedCustomer(Request $request): ?Customer
    {
        if (!$request->user()) {
            return null;
        }

        return Customer::where('user_id', $request->user()->id)->first();
    }

    private function formatWishlistItem(Wishlist $w): array
    {
        return [
            'id'         => $w->id,
            'product_id' => $w->product_id,
            'added_at'   => $w->created_at?->toISOString(),
            'product'    => $w->product ? [
                'id'             => $w->product->id,
                'name'           => $w->product->name,
                'slug'           => $w->product->slug,
                'sku'            => $w->product->sku,
                'selling_price'  => (float) $w->product->selling_price,
                'compare_price'  => (float) $w->product->compare_price,
                'discount_pct'   => $w->product->discount_percent_attribute ?? 0,
                'image'          => $w->product->primaryImage?->url,
                'status'         => $w->product->status,
                'category'       => $w->product->category?->name,
                'brand'          => $w->product->brand?->name,
            ] : null,
        ];
    }
}
