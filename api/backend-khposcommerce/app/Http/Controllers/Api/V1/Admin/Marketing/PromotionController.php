<?php

namespace App\Http\Controllers\Api\V1\Admin\Marketing;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Marketing\CreatePromotionRequest;
use App\Http\Requests\Marketing\UpdatePromotionRequest;
use App\Http\Resources\Marketing\PromotionResource;
use App\Services\Marketing\PromotionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends BaseApiController
{
    public function __construct(private readonly PromotionService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            PromotionResource::collection($records),
            'Promotion list retrieved successfully'
        );
    }

    public function store(CreatePromotionRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new PromotionResource($record),
            'Promotion created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new PromotionResource($record),
            'Promotion details retrieved successfully'
        );
    }

    public function update(UpdatePromotionRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new PromotionResource($record),
            'Promotion updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Promotion deleted successfully'
        );
    }
}
