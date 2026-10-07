<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Order\CreateShipmentRequest;
use App\Http\Requests\Order\UpdateShipmentRequest;
use App\Http\Resources\Order\ShipmentResource;
use App\Services\Order\ShipmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShipmentController extends BaseApiController
{
    public function __construct(private readonly ShipmentService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            ShipmentResource::collection($records),
            'Shipment list retrieved successfully'
        );
    }

    public function store(CreateShipmentRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new ShipmentResource($record),
            'Shipment created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new ShipmentResource($record),
            'Shipment details retrieved successfully'
        );
    }

    public function update(UpdateShipmentRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new ShipmentResource($record),
            'Shipment updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Shipment deleted successfully'
        );
    }
}
