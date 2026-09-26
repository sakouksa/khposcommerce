<?php

namespace App\Http\Controllers\Api\V1\Admin\Shipping;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Shipping\CreateShippingRateRequest;
use App\Http\Requests\Shipping\UpdateShippingRateRequest;
use App\Http\Resources\Shipping\ShippingRateResource;
use App\Services\Shipping\ShippingRateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingRateController extends BaseApiController
{
    public function __construct(private readonly ShippingRateService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ShippingRateResource::collection($records),
            'ShippingRate list retrieved successfully'
        );
    }

    public function store(CreateShippingRateRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ShippingRateResource($record),
            'ShippingRate created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ShippingRateResource($record),
            'ShippingRate details retrieved successfully'
        );
    }

    public function update(UpdateShippingRateRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ShippingRateResource($record),
            'ShippingRate updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'ShippingRate deleted successfully'
        );
    }
}
