<?php

namespace App\Http\Controllers\Api\V1\Admin\Review;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Review\CreateProductReviewRequest;
use App\Http\Requests\Review\UpdateProductReviewRequest;
use App\Http\Resources\Review\ProductReviewResource;
use App\Services\Review\ProductReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductReviewController extends BaseApiController
{
    public function __construct(private readonly ProductReviewService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ProductReviewResource::collection($records),
            'ProductReview list retrieved successfully'
        );
    }

    public function store(CreateProductReviewRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ProductReviewResource($record),
            'ProductReview created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ProductReviewResource($record),
            'ProductReview details retrieved successfully'
        );
    }

    public function update(UpdateProductReviewRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ProductReviewResource($record),
            'ProductReview updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'ProductReview deleted successfully'
        );
    }
}
