<?php

namespace App\Http\Controllers\Api\V1\Admin\Shipping;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Shipping\CreateShippingZoneRequest;
use App\Http\Requests\Shipping\UpdateShippingZoneRequest;
use App\Http\Resources\Shipping\ShippingZoneResource;
use App\Services\Shipping\ShippingZoneService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingZoneController extends BaseApiController
{
    public function __construct(private readonly ShippingZoneService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ShippingZoneResource::collection($records),
            'ShippingZone list retrieved successfully'
        );
    }

    public function store(CreateShippingZoneRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ShippingZoneResource($record),
            'ShippingZone created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ShippingZoneResource($record),
            'ShippingZone details retrieved successfully'
        );
    }

    public function update(UpdateShippingZoneRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ShippingZoneResource($record),
            'ShippingZone updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'ShippingZone deleted successfully'
        );
    }
}
