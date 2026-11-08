<?php

namespace App\Http\Controllers\Api\V1\Admin\Inventory;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Inventory\CreateInventoryMovementRequest;
use App\Http\Requests\Inventory\UpdateInventoryMovementRequest;
use App\Http\Resources\Inventory\InventoryMovementResource;
use App\Services\Inventory\InventoryMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryMovementController extends BaseApiController
{
    public function __construct(private readonly InventoryMovementService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = \App\Models\Inventory\InventoryMovement::with([
            'product.category',
            'product.primaryImage',
            'warehouse:id,name',
            'user:id,name'
        ])
        ->when($request->product_id, fn($q, $productId) => $q->where('product_id', $productId))
        ->when($request->warehouse_id, fn($q, $warehouseId) => $q->where('warehouse_id', $warehouseId))
        ->when($request->type ?? $request->status, fn($q, $type) => $q->where('type', $type))
        ->when($request->category_id, function ($q, $catId) {
            $q->whereHas('product', fn($pq) => $pq->where('category_id', $catId));
        })
        ->when($request->brand_id, function ($q, $brandId) {
            $q->whereHas('product', fn($pq) => $pq->where('brand_id', $brandId));
        })
        ->when($request->supplier_id, function ($q, $supplierId) {
            $q->whereIn('product_id', function ($sub) use ($supplierId) {
                $sub->select('product_id')
                    ->from('purchase_items')
                    ->join('purchases', 'purchases.id', '=', 'purchase_items.purchase_id')
                    ->where('purchases.supplier_id', $supplierId);
            });
        })
        ->when($request->user_id ?? $request->created_by, fn($q, $userId) => $q->where('user_id', $userId))
        ->when($request->start_date ?? $request->created_start, fn($q, $start) => $q->whereDate('created_at', '>=', $start))
        ->when($request->end_date ?? $request->created_end, fn($q, $end) => $q->whereDate('created_at', '<=', $end))
        ->when($request->filled('search'), function ($q) use ($request) {
            $search = trim($request->search);
            $lowerSearch = mb_strtolower($search);
            $q->where(function ($sq) use ($lowerSearch) {
                $sq->whereHas('product', fn($pq) => $pq->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"])->orWhereRaw('LOWER(sku) LIKE ?', ["%{$lowerSearch}%"]))
                   ->orWhereHas('warehouse', fn($wq) => $wq->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"]))
                   ->orWhereRaw('LOWER(notes) LIKE ?', ["%{$lowerSearch}%"])
                   ->orWhereRaw('LOWER(reference_type) LIKE ?', ["%{$lowerSearch}%"]);
            });
        })
        ->orderBy('created_at', 'desc');

        $records = $query->paginate($request->integer('per_page', 10));

        return $this->paginatedResourceResponse(
            InventoryMovementResource::collection($records),
            $records
        );
    }

    public function store(CreateInventoryMovementRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new InventoryMovementResource($record),
            'InventoryMovement created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id, [
            'product.category',
            'product.primaryImage',
            'warehouse',
            'user'
        ]);
        return $this->successResponse(
            new InventoryMovementResource($record),
            'InventoryMovement details retrieved successfully'
        );
    }

    public function update(UpdateInventoryMovementRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new InventoryMovementResource($record),
            'InventoryMovement updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'InventoryMovement deleted successfully'
        );
    }
}
