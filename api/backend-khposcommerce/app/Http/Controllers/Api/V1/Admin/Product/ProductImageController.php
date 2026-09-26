<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\CreateProductImageRequest;
use App\Http\Requests\Product\UpdateProductImageRequest;
use App\Http\Resources\Product\ProductImageResource;
use App\Services\Product\ProductImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductImageController extends BaseApiController
{
    public function __construct(private readonly ProductImageService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ProductImageResource::collection($records),
            'ProductImage list retrieved successfully'
        );
    }

    public function store(CreateProductImageRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ProductImageResource($record),
            'ProductImage created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ProductImageResource($record),
            'ProductImage details retrieved successfully'
        );
    }

    public function update(UpdateProductImageRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ProductImageResource($record),
            'ProductImage updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'ProductImage deleted successfully'
        );
    }
}
