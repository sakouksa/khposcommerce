<?php

namespace App\Http\Controllers\Api\V1\Admin\Product;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Product\CreateAttributeValueRequest;
use App\Http\Requests\Product\UpdateAttributeValueRequest;
use App\Http\Resources\Product\AttributeValueResource;
use App\Services\Product\AttributeValueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttributeValueController extends BaseApiController
{
    public function __construct(private readonly AttributeValueService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            AttributeValueResource::collection($records),
            'AttributeValue list retrieved successfully'
        );
    }

    public function store(CreateAttributeValueRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new AttributeValueResource($record),
            'AttributeValue created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new AttributeValueResource($record),
            'AttributeValue details retrieved successfully'
        );
    }

    public function update(UpdateAttributeValueRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new AttributeValueResource($record),
            'AttributeValue updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'AttributeValue deleted successfully'
        );
    }
}
