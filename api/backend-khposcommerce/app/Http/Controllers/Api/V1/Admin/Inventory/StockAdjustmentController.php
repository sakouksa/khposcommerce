<?php

namespace App\Http\Controllers\Api\V1\Admin\Inventory;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Inventory\StockAdjustment;
use App\Models\Inventory\StockAdjustmentItem;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use App\Http\Resources\Inventory\StockAdjustmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockAdjustmentController extends BaseApiController
{
    /**
     * GET /api/v1/stock-adjustments
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockAdjustment::with(['warehouse', 'user', 'items.product', 'items.variant'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = trim($request->search);
                $lowerSearch = mb_strtolower($search);
                $q->where(function ($sq) use ($lowerSearch) {
                    $sq->whereRaw('LOWER(reference_number) LIKE ?', ["%{$lowerSearch}%"])
                       ->orWhereRaw('LOWER(reason) LIKE ?', ["%{$lowerSearch}%"])
                       ->orWhereHas('items', fn($iq) => $iq->whereRaw('LOWER(notes) LIKE ?', ["%{$lowerSearch}%"]))
                       ->orWhereHas('warehouse', fn($wq) => $wq->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"]))
                       ->orWhereHas('items.product', fn($pq) => $pq->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"])->orWhereRaw('LOWER(sku) LIKE ?', ["%{$lowerSearch}%"]));
                });
            })
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->warehouse_id, fn($q, $w) => $q->where('warehouse_id', $w))
            ->when($request->user_id ?? $request->created_by, fn($q, $u) => $q->where('user_id', $u))
            ->when($request->category_id, function ($q, $catId) {
                $q->whereHas('items.product', fn($pq) => $pq->where('category_id', $catId));
            })
            ->when($request->brand_id, function ($q, $brandId) {
                $q->whereHas('items.product', fn($pq) => $pq->where('brand_id', $brandId));
            })
            ->when($request->start_date ?? $request->created_start, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->end_date ?? $request->created_end, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($request->trash == 'true', fn($q) => $q->onlyTrashed())
            ->orderBy('id', 'desc');

        $adjustments = $query->paginate($request->integer('per_page', 10));

        return response()->json([
            'success'    => true,
            'message'    => 'Success',
            'data'       => StockAdjustmentResource::collection($adjustments)->resolve(),
            'pagination' => [
                'total'        => $adjustments->total(),
                'per_page'     => $adjustments->perPage(),
                'current_page' => $adjustments->currentPage(),
                'last_page'    => $adjustments->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/stock-adjustments
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'type'         => 'required|in:addition,subtraction,recount,in,out,adjustment',
            'reason'       => 'nullable|string',
            'notes'        => 'nullable|string',
            'items'        => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity'   => 'required_with:items|numeric|min:0.0001',
            // Fallback for single item format
            'product_id'   => 'required_without:items|exists:products,id',
            'variant_id'   => 'nullable|exists:product_variants,id',
            'quantity'     => 'required_without:items|numeric|min:0.0001',
            'auto_approve' => 'nullable|boolean',
            'status'       => 'nullable|string',
        ]);

        $refNumber = \App\Services\Support\ReferenceNumberService::stockAdjustment();
        $shouldApprove = $request->has('auto_approve') ? $request->boolean('auto_approve') : true;

        $adjustment = DB::transaction(function () use ($validated, $refNumber, $shouldApprove) {
            $status = $shouldApprove ? 'approved' : 'draft';
            $adj = StockAdjustment::create([
                'company_id'       => 1,
                'warehouse_id'     => $validated['warehouse_id'],
                'user_id'          => Auth::id() ?? 1,
                'reference_number' => $refNumber,
                'date'             => date('Y-m-d'),
                'type'             => $validated['type'],
                'reason'           => $validated['reason'] ?? $validated['notes'] ?? 'Manual Adjustment',
                'status'           => $status,
                'approved_by'      => $shouldApprove ? (Auth::id() ?? 1) : null,
                'approved_at'      => $shouldApprove ? now() : null,
            ]);

            $items = [];
            if (isset($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $items[] = [
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'] ?? null,
                        'quantity' => (float) $item['quantity'],
                    ];
                }
            } else {
                $items[] = [
                    'product_id' => $validated['product_id'],
                    'variant_id' => $validated['variant_id'] ?? null,
                    'quantity' => (float) $validated['quantity'],
                ];
            }

            foreach ($items as $item) {
                // Get current quantity
                $currentStock = Inventory::where([
                    'warehouse_id'       => $validated['warehouse_id'],
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['variant_id'] ?? null,
                ])->first();

                $qtyBefore = $currentStock ? (float) $currentStock->quantity : 0.0;
                $qtyAdjusted = $item['quantity'];

                if ($validated['type'] === 'subtraction' || $validated['type'] === 'out') {
                    $qtyAfter = max(0, $qtyBefore - $qtyAdjusted);
                    $qtyAdjusted = -$qtyAdjusted;
                } elseif ($validated['type'] === 'recount' || $validated['type'] === 'adjustment') {
                    $qtyAfter = $qtyAdjusted;
                    $qtyAdjusted = $qtyAfter - $qtyBefore;
                } else {
                    $qtyAfter = $qtyBefore + $qtyAdjusted;
                }

                StockAdjustmentItem::create([
                    'stock_adjustment_id' => $adj->id,
                    'product_id'          => $item['product_id'],
                    'product_variant_id'  => $item['variant_id'] ?? null,
                    'quantity_before'     => $qtyBefore,
                    'quantity_adjusted'   => $qtyAdjusted,
                    'quantity_after'      => $qtyAfter,
                    'notes'               => $validated['reason'] ?? null,
                ]);

                if ($shouldApprove) {
                    // Update inventory table
                    if ($currentStock) {
                        $currentStock->update(['quantity' => $qtyAfter]);
                    } else {
                        Inventory::create([
                            'company_id'         => 1,
                            'warehouse_id'       => $validated['warehouse_id'],
                            'product_id'         => $item['product_id'],
                            'product_variant_id' => $item['variant_id'] ?? null,
                            'quantity'           => $qtyAfter,
                            'reserved_quantity'  => 0,
                        ]);
                    }

                    // Record inventory movement log
                    $movementType = match ($validated['type']) {
                        'addition', 'in' => 'in',
                        'subtraction', 'out' => 'out',
                        default => 'adjustment',
                    };

                    InventoryMovement::create([
                        'company_id'         => 1,
                        'warehouse_id'       => $validated['warehouse_id'],
                        'product_id'         => $item['product_id'],
                        'product_variant_id' => $item['variant_id'] ?? null,
                        'user_id'            => Auth::id() ?? 1,
                        'reference_type'     => StockAdjustment::class,
                        'reference_id'       => $adj->id,
                        'type'               => $movementType,
                        'quantity'           => $qtyAdjusted,
                        'quantity_before'    => $qtyBefore,
                        'quantity_after'     => $qtyAfter,
                        'notes'              => $validated['reason'] ?? $validated['notes'] ?? 'Stock adjustment log',
                    ]);
                }
            }

            return $adj;
        });

        $message = $shouldApprove ? 'Stock adjustment logged and approved successfully' : 'Stock adjustment created as draft';
        return $this->successResponse(new StockAdjustmentResource($adjustment), $message, 201);
    }

    /**
     * GET /api/v1/stock-adjustments/{id}
     */
    public function show(int $id): JsonResponse
    {
        $adjustment = StockAdjustment::with(['warehouse', 'user', 'items.product', 'items.variant'])->findOrFail($id);
        return $this->successResponse(new StockAdjustmentResource($adjustment));
    }

    /**
     * POST /api/v1/stock-adjustments/{id}/approve
     */
    public function approve(int $id): JsonResponse
    {
        $adjustment = StockAdjustment::findOrFail($id);
        if ($adjustment->status !== 'draft') {
            return $this->errorResponse('Only draft adjustments can be approved.');
        }

        DB::transaction(function () use ($adjustment) {
            $adjustment->update([
                'status'      => 'approved',
                'approved_by' => Auth::id() ?? 1,
                'approved_at' => now(),
            ]);

            foreach ($adjustment->items as $item) {
                // Update stock levels
                $currentStock = Inventory::where([
                    'warehouse_id'       => $adjustment->warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                ])->first();

                $qtyBefore = $currentStock ? (float) $currentStock->quantity : 0.0;
                $qtyAfter = $qtyBefore + (float) $item->quantity_adjusted;

                if ($currentStock) {
                    $currentStock->update(['quantity' => $qtyAfter]);
                } else {
                    Inventory::create([
                        'company_id'         => 1,
                        'warehouse_id'       => $adjustment->warehouse_id,
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity'           => $qtyAfter,
                        'reserved_quantity'  => 0,
                    ]);
                }

                // Record movement
                InventoryMovement::create([
                    'company_id'         => 1,
                    'warehouse_id'       => $adjustment->warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'user_id'            => Auth::id() ?? 1,
                    'reference_type'     => StockAdjustment::class,
                    'reference_id'       => $adjustment->id,
                    'type'               => 'adjustment',
                    'quantity'           => $item->quantity_adjusted,
                    'quantity_before'    => $qtyBefore,
                    'quantity_after'     => $qtyAfter,
                    'notes'              => $adjustment->reason ?? 'Stock adjustment approved',
                ]);
            }
        });

        return $this->successResponse(new StockAdjustmentResource($adjustment), 'Stock adjustment approved successfully');
    }

    /**
     * PUT /api/v1/stock-adjustments/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $adjustment = StockAdjustment::findOrFail($id);
        if ($adjustment->status !== 'draft') {
            return $this->errorResponse('Only draft adjustments can be updated.');
        }

        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'type'         => 'required|in:addition,subtraction,recount',
            'reason'       => 'nullable|string',
            'notes'        => 'nullable|string',
            'items'        => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity'   => 'required|numeric|min:0.0001',
        ]);

        DB::transaction(function () use ($adjustment, $validated) {
            $adjustment->update([
                'warehouse_id' => $validated['warehouse_id'],
                'type'         => $validated['type'],
                'reason'       => $validated['reason'] ?? $validated['notes'] ?? $adjustment->reason,
            ]);

            // Delete old items
            $adjustment->items()->delete();

            // Create new items
            foreach ($validated['items'] as $item) {
                $currentStock = Inventory::where([
                    'warehouse_id'       => $validated['warehouse_id'],
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['variant_id'] ?? null,
                ])->first();

                $qtyBefore = $currentStock ? (float) $currentStock->quantity : 0.0;
                $qtyAdjusted = $item['quantity'];

                if ($validated['type'] === 'subtraction') {
                    $qtyAfter = $qtyBefore - $qtyAdjusted;
                    $qtyAdjusted = -$qtyAdjusted;
                } elseif ($validated['type'] === 'recount') {
                    $qtyAfter = $qtyAdjusted;
                    $qtyAdjusted = $qtyAfter - $qtyBefore;
                } else {
                    $qtyAfter = $qtyBefore + $qtyAdjusted;
                }

                StockAdjustmentItem::create([
                    'stock_adjustment_id' => $adjustment->id,
                    'product_id'          => $item['product_id'],
                    'product_variant_id'  => $item['variant_id'] ?? null,
                    'quantity_before'     => $qtyBefore,
                    'quantity_adjusted'   => $qtyAdjusted,
                    'quantity_after'      => $qtyAfter,
                    'notes'               => $validated['reason'] ?? null,
                ]);
            }
        });

        return $this->successResponse(new StockAdjustmentResource($adjustment), 'Stock adjustment updated successfully');
    }

    /**
     * DELETE /api/v1/stock-adjustments/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $adjustment = StockAdjustment::findOrFail($id);
        $adjustment->delete();
        return $this->successResponse(null, 'Stock adjustment soft deleted successfully');
    }

    /**
     * POST /api/v1/stock-adjustments/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        $adjustment = StockAdjustment::onlyTrashed()->findOrFail($id);
        $adjustment->restore();
        return $this->successResponse(new StockAdjustmentResource($adjustment), 'Stock adjustment restored successfully');
    }

    /**
     * DELETE /api/v1/stock-adjustments/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        $adjustment = StockAdjustment::onlyTrashed()->findOrFail($id);
        $adjustment->forceDelete();
        return $this->successResponse(null, 'Stock adjustment permanently deleted');
    }

    /**
     * POST /api/v1/stock-adjustments/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        StockAdjustment::whereIn('id', $request->ids)->delete();
        return $this->successResponse(null, 'Selected adjustments soft deleted');
    }

    /**
     * POST /api/v1/stock-adjustments/bulk-restore
     */
    public function bulkRestore(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        StockAdjustment::onlyTrashed()->whereIn('id', $request->ids)->restore();
        return $this->successResponse(null, 'Selected adjustments restored');
    }

    /**
     * GET /api/v1/stock-adjustments/export
     */
    public function export(Request $request)
    {
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=stock_adjustments_" . date('Ymd_His') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Reference Number', 'Date', 'Type', 'Warehouse', 'Reason', 'Status']);

            StockAdjustment::with('warehouse')
                ->chunk(100, function($adjustments) use ($file) {
                    foreach ($adjustments as $adj) {
                        fputcsv($file, [
                            $adj->id,
                            $adj->reference_number,
                            $adj->date,
                            $adj->type,
                            $adj->warehouse ? $adj->warehouse->name : 'N/A',
                            $adj->reason,
                            $adj->status
                        ]);
                    }
                });
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
