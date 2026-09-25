<?php

namespace App\Http\Controllers\Api\V1\Admin\Setting;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Controllers\Api\Traits\HasBulkActions;
use App\Http\Requests\Setting\CreateCityRequest;
use App\Http\Requests\Setting\UpdateCityRequest;
use App\Http\Resources\Setting\CityResource;
use App\Services\Setting\CityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CityController extends BaseApiController
{
    use HasBulkActions;

    public function __construct(protected readonly CityService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            CityResource::collection($records),
            'City list retrieved successfully'
        );
    }

    public function store(CreateCityRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new CityResource($record),
            'City created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new CityResource($record),
            'City details retrieved successfully'
        );
    }

    public function update(UpdateCityRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new CityResource($record),
            'City updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'City deleted successfully'
        );
    }
}
