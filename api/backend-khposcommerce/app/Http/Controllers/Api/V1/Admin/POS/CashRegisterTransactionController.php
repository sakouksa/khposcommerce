<?php

namespace App\Http\Controllers\Api\V1\Admin\POS;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\POS\CreateCashRegisterTransactionRequest;
use App\Http\Requests\POS\UpdateCashRegisterTransactionRequest;
use App\Http\Resources\POS\CashRegisterTransactionResource;
use App\Services\POS\CashRegisterTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashRegisterTransactionController extends BaseApiController
{
    public function __construct(private readonly CashRegisterTransactionService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->service->getPaginated($request->get('per_page', 15));
        return $this->successResponse(
            CashRegisterTransactionResource::collection($records),
            'CashRegisterTransaction list retrieved successfully'
        );
    }

    public function store(CreateCashRegisterTransactionRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new CashRegisterTransactionResource($record),
            'CashRegisterTransaction created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new CashRegisterTransactionResource($record),
            'CashRegisterTransaction details retrieved successfully'
        );
    }

    public function update(UpdateCashRegisterTransactionRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new CashRegisterTransactionResource($record),
            'CashRegisterTransaction updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'CashRegisterTransaction deleted successfully'
        );
    }
}
