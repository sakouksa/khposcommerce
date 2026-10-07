<?php

namespace App\Http\Controllers\Api\V1\Admin\Sales;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Sales\CreateSaleReturnRequest;
use App\Http\Requests\Sales\UpdateSaleReturnRequest;
use App\Http\Resources\Sales\SaleReturnResource;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleReturn;
use App\Services\Sales\SaleReturnService;
use App\Services\Support\AccessScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleReturnController extends BaseApiController
{
    public function __construct(private readonly SaleReturnService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', SaleReturn::class);
        $user = $request->user();

        $query = SaleReturn::with(['sale', 'user', 'items']);
        if (!$user?->hasRole(['super_admin', 'owner'])) {
            $accessibleBranches = $user?->accessibleBranchIds() ?? [];
            $query->whereHas('sale', fn($sq) => $sq->whereIn('branch_id', $accessibleBranches));
        }

        if ($request->filled('branch_id')) {
            $branchId = $request->integer('branch_id');
            AccessScopeService::validateBranchAccess($user, $branchId, 'filter returns by this branch');
            $query->whereHas('sale', fn($sq) => $sq->where('branch_id', $branchId));
        }

        $records = $query->latest('id')->paginate($request->get('per_page', 15));

        return $this->successResponse(
            SaleReturnResource::collection($records),
            'SaleReturn list retrieved successfully'
        );
    }

    public function store(CreateSaleReturnRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $sale = Sale::findOrFail($validated['sale_id']);
        $this->authorize('return', $sale);

        $record = $this->service->create($validated);
        return $this->successResponse(
            new SaleReturnResource($record),
            'SaleReturn created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id, ['sale', 'user', 'items']);
        $this->authorize('view', $record);

        return $this->successResponse(
            new SaleReturnResource($record),
            'SaleReturn details retrieved successfully'
        );
    }

    public function update(UpdateSaleReturnRequest $request, int $id): JsonResponse
    {
        $record = $this->service->getById($id, ['sale']);
        $this->authorize('update', $record);

        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new SaleReturnResource($record),
            'SaleReturn updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $record = $this->service->getById($id, ['sale']);
        $this->authorize('delete', $record);

        $this->service->delete($id);
        return $this->successResponse(
            null,
            'SaleReturn deleted successfully'
        );
    }
}
