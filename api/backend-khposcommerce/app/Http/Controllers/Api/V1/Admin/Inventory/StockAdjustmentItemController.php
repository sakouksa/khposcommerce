<?php

namespace App\Http\Controllers\Api\V1\Admin\Inventory;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Inventory\CreateStockAdjustmentItemRequest;
use App\Http\Requests\Inventory\UpdateStockAdjustmentItemRequest;
use App\Http\Resources\Inventory\StockAdjustmentItemResource;
use App\Services\Inventory\StockAdjustmentItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockAdjustmentItemController extends BaseApiController
{
    public function __construct(private readonly StockAdjustmentItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            StockAdjustmentItemResource::collection($records),
            'StockAdjustmentItem list retrieved successfully'
        );
    }

    public function store(CreateStockAdjustmentItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new StockAdjustmentItemResource($record),
            'StockAdjustmentItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new StockAdjustmentItemResource($record),
            'StockAdjustmentItem details retrieved successfully'
        );
    }

    public function update(UpdateStockAdjustmentItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new StockAdjustmentItemResource($record),
            'StockAdjustmentItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'StockAdjustmentItem deleted successfully'
        );
    }
}
