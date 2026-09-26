<?php

namespace App\Http\Controllers\Api\V1\Admin\Purchase;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Purchase\CreatePurchaseItemRequest;
use App\Http\Requests\Purchase\UpdatePurchaseItemRequest;
use App\Http\Resources\Purchase\PurchaseItemResource;
use App\Services\Purchase\PurchaseItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseItemController extends BaseApiController
{
    public function __construct(private readonly PurchaseItemService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            PurchaseItemResource::collection($records),
            'PurchaseItem list retrieved successfully'
        );
    }

    public function store(CreatePurchaseItemRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new PurchaseItemResource($record),
            'PurchaseItem created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new PurchaseItemResource($record),
            'PurchaseItem details retrieved successfully'
        );
    }

    public function update(UpdatePurchaseItemRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new PurchaseItemResource($record),
            'PurchaseItem updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'PurchaseItem deleted successfully'
        );
    }
}
