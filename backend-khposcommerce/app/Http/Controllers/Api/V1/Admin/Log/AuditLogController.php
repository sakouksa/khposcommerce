<?php

namespace App\Http\Controllers\Api\V1\Admin\Log;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Log\CreateAuditLogRequest;
use App\Http\Requests\Log\UpdateAuditLogRequest;
use App\Http\Resources\Log\AuditLogResource;
use App\Services\Log\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends BaseApiController
{
    public function __construct(private readonly AuditLogService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            AuditLogResource::collection($records),
            'AuditLog list retrieved successfully'
        );
    }

    public function store(CreateAuditLogRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new AuditLogResource($record),
            'AuditLog created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new AuditLogResource($record),
            'AuditLog details retrieved successfully'
        );
    }

    public function update(UpdateAuditLogRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new AuditLogResource($record),
            'AuditLog updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'AuditLog deleted successfully'
        );
    }
}
