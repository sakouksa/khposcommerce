<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Review\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends BaseApiController
{
    /** Admin: list all reviews with filters */
    public function index(Request $request): JsonResponse
    {
        $query = ProductReview::with(['customer', 'product'])
            ->when($request->filled('search'), fn($q) =>
                $q->where('body', 'like', "%{$request->search}%")
                  ->orWhere('title', 'like', "%{$request->search}%")
            )
            ->when($request->filled('status'), fn($q) =>
                $q->where('status', $request->status)
            )
            ->when($request->filled('rating'), fn($q) =>
                $q->where('rating', $request->rating)
            )
            ->orderBy('created_at', 'desc');

        $reviews = $query->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($reviews);
    }

    /** Admin / Customer: submit or record a review */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'title'      => 'nullable|string|max:255',
            'body'       => 'nullable|string',
            'comment'    => 'nullable|string',
        ]);

        $review = ProductReview::create([
            'product_id' => $validated['product_id'],
            'rating'     => $validated['rating'],
            'title'      => $validated['title'] ?? null,
            'body'       => $validated['body'] ?? $validated['comment'] ?? '',
            'status'     => 'approved',
        ]);

        return $this->successResponse($review, 'Review created successfully.', 201);
    }

    /** Admin: approve a review */
    public function approve(int $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);
        $review->update(['status' => 'approved']);

        return $this->successResponse($review, 'Review approved.');
    }

    /** Admin: reject a review */
    public function reject(int $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);
        $review->update(['status' => 'rejected']);

        return $this->successResponse($review, 'Review rejected.');
    }

    /** Admin: delete a review */
    public function destroy(int $id): JsonResponse
    {
        ProductReview::findOrFail($id)->delete();

        return $this->successResponse(null, 'Review deleted.');
    }
}
