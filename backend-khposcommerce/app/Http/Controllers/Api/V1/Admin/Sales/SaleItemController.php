<?php

namespace App\Http\Controllers\Api\V1\Admin\Sales;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Sales\CreateSaleItemRequest;
use App\Http\Requests\Sales\UpdateSaleItemRequest;
use App\Http\Resources\Sales\SaleItemResource;
use App\Services\Sales\SaleItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleItemController extends BaseApiController
{
    public function __construct(private readonly SaleItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            SaleItemResource::collection($records),
            'SaleItem list retrieved successfully'
        );
    }

    public function store(CreateSaleItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new SaleItemResource($record),
            'SaleItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new SaleItemResource($record),
            'SaleItem details retrieved successfully'
        );
    }

    public function update(UpdateSaleItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new SaleItemResource($record),
            'SaleItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'SaleItem deleted successfully'
        );
    }
}
