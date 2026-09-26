<?php

namespace App\Http\Controllers\Api\V1\Admin\Sales;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Sales\CreateSaleReturnItemRequest;
use App\Http\Requests\Sales\UpdateSaleReturnItemRequest;
use App\Http\Resources\Sales\SaleReturnItemResource;
use App\Services\Sales\SaleReturnItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleReturnItemController extends BaseApiController
{
    public function __construct(private readonly SaleReturnItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            SaleReturnItemResource::collection($records),
            'SaleReturnItem list retrieved successfully'
        );
    }

    public function store(CreateSaleReturnItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new SaleReturnItemResource($record),
            'SaleReturnItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new SaleReturnItemResource($record),
            'SaleReturnItem details retrieved successfully'
        );
    }

    public function update(UpdateSaleReturnItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new SaleReturnItemResource($record),
            'SaleReturnItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'SaleReturnItem deleted successfully'
        );
    }
}
