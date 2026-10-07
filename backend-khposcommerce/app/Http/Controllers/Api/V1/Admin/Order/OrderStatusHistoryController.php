<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Order\CreateOrderStatusHistoryRequest;
use App\Http\Requests\Order\UpdateOrderStatusHistoryRequest;
use App\Http\Resources\Order\OrderStatusHistoryResource;
use App\Services\Order\OrderStatusHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderStatusHistoryController extends BaseApiController
{
    public function __construct(private readonly OrderStatusHistoryService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            OrderStatusHistoryResource::collection($records),
            'OrderStatusHistory list retrieved successfully'
        );
    }

    public function store(CreateOrderStatusHistoryRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new OrderStatusHistoryResource($record),
            'OrderStatusHistory created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new OrderStatusHistoryResource($record),
            'OrderStatusHistory details retrieved successfully'
        );
    }

    public function update(UpdateOrderStatusHistoryRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new OrderStatusHistoryResource($record),
            'OrderStatusHistory updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'OrderStatusHistory deleted successfully'
        );
    }
}
