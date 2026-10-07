<?php

namespace App\Http\Controllers\Api\V1\Admin\Inventory;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Inventory\StockOpname;
use App\Models\Inventory\StockOpnameItem;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockOpnameController extends BaseApiController
{
    /**
     * GET /api/v1/stock-opnames
     */
    public function index(Request $request): JsonResponse
    {
        $opnames = StockOpname::with(['warehouse', 'user', 'items.product', 'items.variant'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = trim($request->search);
                $lowerSearch = mb_strtolower($search);
                $q->where(function ($sq) use ($lowerSearch) {
                    $sq->whereRaw('LOWER(reference_number) LIKE ?', ["%{$lowerSearch}%"])
                       ->orWhereRaw('LOWER(notes) LIKE ?', ["%{$lowerSearch}%"])
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
            ->orderBy('id', 'desc')
            ->paginate($request->integer('per_page', 15));

        return $this->paginatedResponse($opnames);
    }

    /**
     * POST /api/v1/stock-opnames
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'notes'        => 'nullable|string',
        ]);

        $refNumber = \App\Services\Support\ReferenceNumberService::stockOpname();

        $opname = DB::transaction(function () use ($validated, $refNumber) {
            $op = StockOpname::create([
                'company_id'       => 1,
                'warehouse_id'     => $validated['warehouse_id'],
                'user_id'          => Auth::id() ?? 1,
                'reference_number' => $refNumber,
                'date'             => date('Y-m-d'),
                'notes'            => $validated['notes'] ?? '',
                'status'           => 'draft', // Starts as draft
            ]);

            // Snap current system quantities from inventories table for selected warehouse
            $inventories = Inventory::where('warehouse_id', $validated['warehouse_id'])->get();

            foreach ($inventories as $inv) {
                StockOpnameItem::create([
                    'stock_opname_id'    => $op->id,
                    'product_id'         => $inv->product_id,
                    'product_variant_id' => $inv->product_variant_id,
                    'system_quantity'    => $inv->quantity,
                    'physical_quantity'  => $inv->quantity, // default physical qty to system qty
                    'difference'         => 0,
                    'notes'              => 'Initial snapshot',
                ]);
            }

            return $op;
        });

        return $this->successResponse($opname, 'Stock opname created as draft', 201);
    }

    /**
     * GET /api/v1/stock-opnames/{id}
     */
    public function show(int $id): JsonResponse
    {
        $opname = StockOpname::with(['warehouse', 'user', 'items.product', 'items.variant'])->findOrFail($id);
        return $this->successResponse($opname);
    }

    /**
     * POST /api/v1/stock-opnames/{id}/complete
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $opname = StockOpname::findOrFail($id);
        if ($opname->status === 'done') {
            return $this->successResponse($opname, 'Opname is already completed.');
        }

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:stock_opname_items,id',
            'items.*.physical_quantity' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($opname, $validated) {
            $opname->update([
                'status'       => 'done',
                'completed_at' => now(),
            ]);

            foreach ($validated['items'] as $itemData) {
                $item = StockOpnameItem::findOrFail($itemData['id']);
                $physicalQty = (float) $itemData['physical_quantity'];
                $systemQty = (float) $item->system_quantity;
                $diff = $physicalQty - $systemQty;

                $item->update([
                    'physical_quantity' => $physicalQty,
                    'difference'        => $diff,
                    'notes'             => $itemData['notes'] ?? 'Stock opname count submitted',
                ]);

                // Update inventories table
                $inv = Inventory::where([
                    'warehouse_id'       => $opname->warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                ])->first();

                if ($inv) {
                    $inv->update(['quantity' => $physicalQty]);
                } else {
                    Inventory::create([
                        'company_id'         => 1,
                        'warehouse_id'       => $opname->warehouse_id,
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity'           => $physicalQty,
                        'reserved_quantity'  => 0,
                    ]);
                }

                // If there is a difference, record in movements log
                if ($diff != 0) {
                    InventoryMovement::create([
                        'company_id'         => 1,
                        'warehouse_id'       => $opname->warehouse_id,
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'user_id'            => Auth::id() ?? 1,
                        'reference_type'     => StockOpname::class,
                        'reference_id'       => $opname->id,
                        'type'               => 'opname',
                        'quantity'           => $diff,
                        'quantity_before'    => $systemQty,
                        'quantity_after'     => $physicalQty,
                        'notes'              => $itemData['notes'] ?? "Stock opname discrepancy count",
                    ]);
                }
            }
        });

        return $this->successResponse($opname, 'Stock opname completed and stock levels updated successfully');
    }

    /**
     * DELETE /api/v1/stock-opnames/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $opname = StockOpname::findOrFail($id);
        $opname->delete();
        return $this->successResponse(null, 'Stock opname soft deleted successfully');
    }

    /**
     * POST /api/v1/stock-opnames/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        $opname = StockOpname::onlyTrashed()->findOrFail($id);
        $opname->restore();
        return $this->successResponse($opname, 'Stock opname restored successfully');
    }

    /**
     * DELETE /api/v1/stock-opnames/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        $opname = StockOpname::onlyTrashed()->findOrFail($id);
        $opname->forceDelete();
        return $this->successResponse(null, 'Stock opname permanently deleted');
    }

    /**
     * POST /api/v1/stock-opnames/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        StockOpname::whereIn('id', $request->ids)->delete();
        return $this->successResponse(null, 'Selected opnames soft deleted');
    }

    /**
     * POST /api/v1/stock-opnames/bulk-restore
     */
    public function bulkRestore(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        StockOpname::onlyTrashed()->whereIn('id', $request->ids)->restore();
        return $this->successResponse(null, 'Selected opnames restored');
    }

    /**
     * GET /api/v1/stock-opnames/export
     */
    public function export(Request $request)
    {
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=stock_opnames_" . date('Ymd_His') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Reference Number', 'Date', 'Warehouse', 'Status', 'Completed At']);

            StockOpname::with('warehouse')
                ->chunk(100, function($opnames) use ($file) {
                    foreach ($opnames as $op) {
                        fputcsv($file, [
                            $op->id,
                            $op->reference_number,
                            $op->date,
                            $op->warehouse ? $op->warehouse->name : 'N/A',
                            $op->status,
                            $op->completed_at
                        ]);
                    }
                });
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
