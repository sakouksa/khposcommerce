<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Order\CreateOrderItemRequest;
use App\Http\Requests\Order\UpdateOrderItemRequest;
use App\Http\Resources\Order\OrderItemResource;
use App\Services\Order\OrderItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemController extends BaseApiController
{
    public function __construct(private readonly OrderItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            OrderItemResource::collection($records),
            'OrderItem list retrieved successfully'
        );
    }

    public function store(CreateOrderItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new OrderItemResource($record),
            'OrderItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new OrderItemResource($record),
            'OrderItem details retrieved successfully'
        );
    }

    public function update(UpdateOrderItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new OrderItemResource($record),
            'OrderItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'OrderItem deleted successfully'
        );
    }
}
