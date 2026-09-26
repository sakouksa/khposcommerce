<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\CreateProductPriceRequest;
use App\Http\Requests\Product\UpdateProductPriceRequest;
use App\Http\Resources\Product\ProductPriceResource;
use App\Services\Product\ProductPriceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductPriceController extends BaseApiController
{
    public function __construct(private readonly ProductPriceService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ProductPriceResource::collection($records),
            'ProductPrice list retrieved successfully'
        );
    }

    public function store(CreateProductPriceRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ProductPriceResource($record),
            'ProductPrice created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ProductPriceResource($record),
            'ProductPrice details retrieved successfully'
        );
    }

    public function update(UpdateProductPriceRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ProductPriceResource($record),
            'ProductPrice updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'ProductPrice deleted successfully'
        );
    }
}
