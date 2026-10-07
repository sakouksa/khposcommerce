<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Customer\Customer;
use App\Models\Review\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends BaseApiController
{
    /**
     * Customer: Submit a product review
     * POST /api/v1/customer/reviews
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id'    => 'required|integer|exists:products,id',
            'order_item_id' => 'nullable|integer|exists:order_items,id',
            'rating'        => 'required|integer|min:1|max:5',
            'title'         => 'nullable|string|max:255',
            'body'          => 'nullable|string',
            'comment'       => 'nullable|string',
        ]);

        $user = $request->user();
        $customer = $user ? Customer::where('user_id', $user->id)->first() : null;

        $review = ProductReview::create([
            'product_id'           => $validated['product_id'],
            'customer_id'          => $customer?->id,
            'order_item_id'        => $validated['order_item_id'] ?? null,
            'name'                 => $customer?->name ?? $user?->name ?? 'Customer',
            'email'                => $customer?->email ?? $user?->email,
            'rating'               => $validated['rating'],
            'title'                => $validated['title'] ?? null,
            'body'                 => $validated['body'] ?? $validated['comment'] ?? '',
            'status'               => 'pending',
            'is_verified_purchase' => !empty($validated['order_item_id']),
        ]);

        return $this->successResponse($review, 'Review submitted successfully and is pending approval.', 201);
    }
}
