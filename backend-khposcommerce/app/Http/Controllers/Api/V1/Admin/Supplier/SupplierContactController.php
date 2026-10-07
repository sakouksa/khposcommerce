<?php

namespace App\Http\Controllers\Api\V1\Admin\Supplier;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Supplier\CreateSupplierContactRequest;
use App\Http\Requests\Supplier\UpdateSupplierContactRequest;
use App\Http\Resources\Supplier\SupplierContactResource;
use App\Services\Supplier\SupplierContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierContactController extends BaseApiController
{
    public function __construct(private readonly SupplierContactService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            SupplierContactResource::collection($records),
            'SupplierContact list retrieved successfully'
        );
    }

    public function store(CreateSupplierContactRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new SupplierContactResource($record),
            'SupplierContact created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new SupplierContactResource($record),
            'SupplierContact details retrieved successfully'
        );
    }

    public function update(UpdateSupplierContactRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new SupplierContactResource($record),
            'SupplierContact updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'SupplierContact deleted successfully'
        );
    }
}
