<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\CreateProductVariantRequest;
use App\Http\Requests\Product\UpdateProductVariantRequest;
use App\Http\Resources\Product\ProductVariantResource;
use App\Services\Product\ProductVariantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductVariantController extends BaseApiController
{
    public function __construct(private readonly ProductVariantService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ProductVariantResource::collection($records),
            'ProductVariant list retrieved successfully'
        );
    }

    public function store(CreateProductVariantRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ProductVariantResource($record),
            'ProductVariant created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ProductVariantResource($record),
            'ProductVariant details retrieved successfully'
        );
    }

    public function update(UpdateProductVariantRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ProductVariantResource($record),
            'ProductVariant updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'ProductVariant deleted successfully'
        );
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        $count = $this->service->bulkDelete($ids);
        return $this->successResponse(
            null,
            "{$count} variants deleted successfully"
        );
    }
}
