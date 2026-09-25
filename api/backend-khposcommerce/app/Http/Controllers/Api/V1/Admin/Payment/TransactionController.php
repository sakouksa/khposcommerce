<?php

namespace App\Http\Controllers\Api\V1\Admin\Payment;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Payment\CreateTransactionRequest;
use App\Http\Requests\Payment\UpdateTransactionRequest;
use App\Http\Resources\Payment\TransactionResource;
use App\Services\Payment\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends BaseApiController
{
    public function __construct(private readonly TransactionService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = \App\Models\Payment\Transaction::with(['payment.paymentMethod', 'company'])
            ->when($request->search, function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('description', 'like', "%{$v}%")
                        ->orWhere('reference_type', 'like', "%{$v}%")
                        ->orWhere('reference_id', 'like', "%{$v}%");
                });
            })
            ->when($request->filled('type'), fn($q) => $q->where('type', $request->type))
            ->orderBy('id', 'desc');

        $records = $query->paginate($request->integer('per_page', 15));

        return $this->successResponse(
            TransactionResource::collection($records),
            'Transaction list retrieved successfully'
        );
    }

    public function store(CreateTransactionRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new TransactionResource($record),
            'Transaction created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(
            new TransactionResource($record),
            'Transaction details retrieved successfully'
        );
    }

    public function update(UpdateTransactionRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new TransactionResource($record),
            'Transaction updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'Transaction deleted successfully'
        );
    }
}
