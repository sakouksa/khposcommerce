<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Order\CreateCartItemRequest;
use App\Http\Requests\Order\UpdateCartItemRequest;
use App\Http\Resources\Order\CartItemResource;
use App\Services\Order\CartItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartItemController extends BaseApiController
{
    public function __construct(private readonly CartItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            CartItemResource::collection($records),
            'CartItem list retrieved successfully'
        );
    }

    public function store(CreateCartItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new CartItemResource($record),
            'CartItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new CartItemResource($record),
            'CartItem details retrieved successfully'
        );
    }

    public function update(UpdateCartItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new CartItemResource($record),
            'CartItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'CartItem deleted successfully'
        );
    }
}
