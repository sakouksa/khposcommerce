<?php

namespace App\Http\Controllers\Api\V1\Admin\Inventory;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Inventory\CreateStockOpnameItemRequest;
use App\Http\Requests\Inventory\UpdateStockOpnameItemRequest;
use App\Http\Resources\Inventory\StockOpnameItemResource;
use App\Services\Inventory\StockOpnameItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockOpnameItemController extends BaseApiController
{
    public function __construct(private readonly StockOpnameItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            StockOpnameItemResource::collection($records),
            'StockOpnameItem list retrieved successfully'
        );
    }

    public function store(CreateStockOpnameItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new StockOpnameItemResource($record),
            'StockOpnameItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new StockOpnameItemResource($record),
            'StockOpnameItem details retrieved successfully'
        );
    }

    public function update(UpdateStockOpnameItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new StockOpnameItemResource($record),
            'StockOpnameItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'StockOpnameItem deleted successfully'
        );
    }
}
