<?php

namespace App\Http\Controllers\Api\V1\Admin\Sales;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Sales\CreateSaleReturnRequest;
use App\Http\Requests\Sales\UpdateSaleReturnRequest;
use App\Http\Resources\Sales\SaleReturnResource;
use App\Services\Sales\SaleReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleReturnController extends BaseApiController
{
    public function __construct(private readonly SaleReturnService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            SaleReturnResource::collection($records),
            'SaleReturn list retrieved successfully'
        );
    }

    public function store(CreateSaleReturnRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new SaleReturnResource($record),
            'SaleReturn created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new SaleReturnResource($record),
            'SaleReturn details retrieved successfully'
        );
    }

    public function update(UpdateSaleReturnRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new SaleReturnResource($record),
            'SaleReturn updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'SaleReturn deleted successfully'
        );
    }
}
