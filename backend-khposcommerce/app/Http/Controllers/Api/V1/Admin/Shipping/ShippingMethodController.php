<?php

namespace App\Http\Controllers\Api\V1\Admin\Shipping;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Shipping\CreateShippingMethodRequest;
use App\Http\Requests\Shipping\UpdateShippingMethodRequest;
use App\Http\Resources\Shipping\ShippingMethodResource;
use App\Services\Shipping\ShippingMethodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingMethodController extends BaseApiController
{
    public function __construct(private readonly ShippingMethodService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ShippingMethodResource::collection($records),
            'ShippingMethod list retrieved successfully'
        );
    }

    public function store(CreateShippingMethodRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ShippingMethodResource($record),
            'ShippingMethod created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ShippingMethodResource($record),
            'ShippingMethod details retrieved successfully'
        );
    }

    public function update(UpdateShippingMethodRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ShippingMethodResource($record),
            'ShippingMethod updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'ShippingMethod deleted successfully'
        );
    }
}
