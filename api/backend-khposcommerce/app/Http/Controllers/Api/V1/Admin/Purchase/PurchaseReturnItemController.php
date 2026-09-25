<?php

namespace App\Http\Controllers\Api\V1\Admin\Purchase;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Purchase\CreatePurchaseReturnItemRequest;
use App\Http\Requests\Purchase\UpdatePurchaseReturnItemRequest;
use App\Http\Resources\Purchase\PurchaseReturnItemResource;
use App\Services\Purchase\PurchaseReturnItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseReturnItemController extends BaseApiController
{
    public function __construct(private readonly PurchaseReturnItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            PurchaseReturnItemResource::collection($records),
            'PurchaseReturnItem list retrieved successfully'
        );
    }

    public function store(CreatePurchaseReturnItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new PurchaseReturnItemResource($record),
            'PurchaseReturnItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new PurchaseReturnItemResource($record),
            'PurchaseReturnItem details retrieved successfully'
        );
    }

    public function update(UpdatePurchaseReturnItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new PurchaseReturnItemResource($record),
            'PurchaseReturnItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'PurchaseReturnItem deleted successfully'
        );
    }
}
