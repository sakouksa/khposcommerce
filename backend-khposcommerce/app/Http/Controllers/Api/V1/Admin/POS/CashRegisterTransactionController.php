<?php

namespace App\Http\Controllers\Api\V1\Admin\POS;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\POS\CreateCashRegisterTransactionRequest;
use App\Http\Requests\POS\UpdateCashRegisterTransactionRequest;
use App\Http\Resources\POS\CashRegisterTransactionResource;
use App\Models\POS\CashRegister;
use App\Models\POS\CashRegisterTransaction;
use App\Services\POS\CashRegisterTransactionService;
use App\Services\Support\AccessScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashRegisterTransactionController extends BaseApiController
{
    public function __construct(private readonly CashRegisterTransactionService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = CashRegisterTransaction::with('cashRegister');

        if ($user) {
            $companyId = (int) ($user->company_id ?? 1);
            $query->whereHas('cashRegister', function ($q) use ($companyId, $user, $request) {
                $q->where('company_id', $companyId);
                $requestedBranchId = $request->filled('branch_id') ? $request->integer('branch_id') : null;
                AccessScopeService::scopeBranches($q, $user, $requestedBranchId);
            });
        }

        if ($request->filled('cash_register_id')) {
            $registerId = $request->integer('cash_register_id');
            $register = CashRegister::findOrFail($registerId);
            $this->authorize('view', $register);
            $query->where('cash_register_id', $registerId);
        }

        $records = $query->latest('id')->paginate($request->integer('per_page', 15));

        return $this->successResponse(
            CashRegisterTransactionResource::collection($records),
            'CashRegisterTransaction list retrieved successfully'
        );
    }

    public function store(CreateCashRegisterTransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $register = CashRegister::findOrFail($validated['cash_register_id']);
        $this->authorize('update', $register);

        $record = $this->service->create($validated);
        return $this->successResponse(
            new CashRegisterTransactionResource($record),
            'CashRegisterTransaction created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = CashRegisterTransaction::with('cashRegister')->findOrFail($id);
        $this->authorize('view', $record->cashRegister);

        return $this->successResponse(
            new CashRegisterTransactionResource($record),
            'CashRegisterTransaction details retrieved successfully'
        );
    }

    public function update(UpdateCashRegisterTransactionRequest $request, int $id): JsonResponse
    {
        $record = CashRegisterTransaction::with('cashRegister')->findOrFail($id);
        $this->authorize('update', $record->cashRegister);

        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new CashRegisterTransactionResource($record),
            'CashRegisterTransaction updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $record = CashRegisterTransaction::with('cashRegister')->findOrFail($id);
        $this->authorize('update', $record->cashRegister);

        $this->service->delete($id);
        return $this->successResponse(
            null,
            'CashRegisterTransaction deleted successfully'
        );
    }
}
