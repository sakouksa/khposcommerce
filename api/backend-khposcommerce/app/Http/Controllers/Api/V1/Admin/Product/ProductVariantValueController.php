<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\CreateProductVariantValueRequest;
use App\Http\Requests\Product\UpdateProductVariantValueRequest;
use App\Http\Resources\Product\ProductVariantValueResource;
use App\Services\Product\ProductVariantValueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductVariantValueController extends BaseApiController
{
    public function __construct(private readonly ProductVariantValueService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ProductVariantValueResource::collection($records),
            'ProductVariantValue list retrieved successfully'
        );
    }

    public function store(CreateProductVariantValueRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ProductVariantValueResource($record),
            'ProductVariantValue created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ProductVariantValueResource($record),
            'ProductVariantValue details retrieved successfully'
        );
    }

    public function update(UpdateProductVariantValueRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ProductVariantValueResource($record),
            'ProductVariantValue updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'ProductVariantValue deleted successfully'
        );
    }
}
