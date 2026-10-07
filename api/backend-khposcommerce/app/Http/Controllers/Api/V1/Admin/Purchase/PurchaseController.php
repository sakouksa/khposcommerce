<?php

namespace App\Http\Controllers\Api\V1\Admin\Purchase;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Purchase\PurchaseRequest;
use App\Http\Requests\Purchase\UpdatePurchaseRequest;
use App\Http\Requests\Purchase\ReceivePurchaseRequest;
use App\Http\Resources\Purchase\PurchaseResource;
use App\Http\Resources\Purchase\PurchaseCollection;
use App\Services\Purchase\PurchaseService;
use App\Models\Purchase\Purchase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Resources\Inventory\InventoryResource;
use App\Http\Resources\Inventory\InventoryMovementResource;

class PurchaseController extends BaseApiController
{
    public function __construct(private readonly PurchaseService $service)
    {
    }

    /**
     * GET /api/v1/purchases
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'payment_status', 'supplier_id', 'warehouse_id', 'sort_by', 'sort_order']);
        $purchases = $this->service->getPaginated($filters, $request->integer('per_page', 10));

        return $this->successResponse(PurchaseResource::collection($purchases), 'Purchase orders retrieved successfully');
    }

    /**
     * GET /api/v1/purchases/{id}
     */
    public function show(int $id): JsonResponse
    {
        $purchase = Purchase::with(['supplier', 'warehouse', 'branch', 'creator', 'items.product.primaryImage', 'items.product.images', 'items.product.category', 'items.variant', 'returns'])->findOrFail($id);
        return $this->successResponse(new PurchaseResource($purchase), 'Purchase order details retrieved successfully');
    }

    /**
     * POST /api/v1/purchases
     */
    public function store(PurchaseRequest $request): JsonResponse
    {
        try {
            $purchase = $this->service->createPurchase($request->validated());
            $purchase->load(['supplier', 'warehouse', 'branch', 'creator', 'items.product.primaryImage', 'items.product.images', 'items.product.category', 'items.variant', 'returns']);
            return $this->successResponse(new PurchaseResource($purchase), 'Purchase order created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * PUT /api/v1/purchases/{id}
     */
    public function update(UpdatePurchaseRequest $request, int $id): JsonResponse
    {
        try {
            $purchase = $this->service->updatePurchase($id, $request->validated());
            $purchase->load(['supplier', 'warehouse', 'branch', 'creator', 'items.product.primaryImage', 'items.product.images', 'items.product.category', 'items.variant', 'returns']);
            return $this->successResponse(new PurchaseResource($purchase), 'Purchase order updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * DELETE /api/v1/purchases/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $purchase = Purchase::findOrFail($id);

        if ($purchase->status !== 'draft') {
            return $this->errorResponse('Only draft purchase orders can be deleted. Please cancel or return non-draft orders.', null, 422);
        }

        $purchase->delete();

        return $this->successResponse(null, 'Purchase order deleted successfully');
    }

    /**
     * POST /api/v1/purchases/{id}/receive
     */
    public function receive(ReceivePurchaseRequest $request, int $id): JsonResponse
    {
        try {
            $result = $this->service->receivePurchase($id, $request->validated());
            $purchase = $result['purchase'];
            $purchase->load(['supplier', 'warehouse', 'branch', 'creator', 'items.product.primaryImage', 'items.product.images', 'items.product.category', 'items.variant', 'returns']);
            
            return $this->successResponse([
                'purchase'            => new PurchaseResource($purchase),
                'updated_inventory'   => InventoryResource::collection($result['updated_inventory']),
                'inventory_movements' => InventoryMovementResource::collection($result['inventory_movements']),
            ], 'Purchase received successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * POST /api/v1/purchases/{id}/cancel
     */
    public function cancel(int $id): JsonResponse
    {
        try {
            $purchase = $this->service->cancelPurchase($id);
            $purchase->load(['supplier', 'warehouse', 'branch', 'creator', 'items.product.primaryImage', 'items.product.images', 'items.product.category', 'items.variant', 'returns']);
            return $this->successResponse(new PurchaseResource($purchase), 'Purchase order cancelled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * POST /api/v1/purchases/{id}/record-payment
     */
    public function recordPayment(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'notes'  => 'nullable|string|max:500',
        ]);

        try {
            $purchase = $this->service->recordPayment(
                $id,
                (float)$request->input('amount'),
                $request->input('notes')
            );
            $purchase->load(['supplier', 'warehouse', 'branch', 'creator', 'items.product.primaryImage', 'items.product.images', 'items.product.category', 'items.variant', 'returns']);
            return $this->successResponse(new PurchaseResource($purchase), 'Payment recorded successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }
}
