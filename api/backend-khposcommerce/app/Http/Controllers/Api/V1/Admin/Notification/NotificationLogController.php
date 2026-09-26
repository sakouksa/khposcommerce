<?php

namespace App\Http\Controllers\Api\V1\Admin\Notification;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Notification\CreateNotificationLogRequest;
use App\Http\Requests\Notification\UpdateNotificationLogRequest;
use App\Http\Resources\Notification\NotificationLogResource;
use App\Services\Notification\NotificationLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationLogController extends BaseApiController
{
    public function __construct(private readonly NotificationLogService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            NotificationLogResource::collection($records),
            'NotificationLog list retrieved successfully'
        );
    }

    public function store(CreateNotificationLogRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new NotificationLogResource($record),
            'NotificationLog created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new NotificationLogResource($record),
            'NotificationLog details retrieved successfully'
        );
    }

    public function update(UpdateNotificationLogRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new NotificationLogResource($record),
            'NotificationLog updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'NotificationLog deleted successfully'
        );
    }
}
