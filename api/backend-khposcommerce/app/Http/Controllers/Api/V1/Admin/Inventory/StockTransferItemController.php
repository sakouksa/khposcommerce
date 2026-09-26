<?php

namespace App\Http\Controllers\Api\V1\Admin\Inventory;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Inventory\CreateStockTransferItemRequest;
use App\Http\Requests\Inventory\UpdateStockTransferItemRequest;
use App\Http\Resources\Inventory\StockTransferItemResource;
use App\Services\Inventory\StockTransferItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockTransferItemController extends BaseApiController
{
    public function __construct(private readonly StockTransferItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            StockTransferItemResource::collection($records),
            'StockTransferItem list retrieved successfully'
        );
    }

    public function store(CreateStockTransferItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new StockTransferItemResource($record),
            'StockTransferItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new StockTransferItemResource($record),
            'StockTransferItem details retrieved successfully'
        );
    }

    public function update(UpdateStockTransferItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new StockTransferItemResource($record),
            'StockTransferItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'StockTransferItem deleted successfully'
        );
    }
}
