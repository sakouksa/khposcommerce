<?php

namespace App\Http\Controllers\Api\V1\Admin\Inventory;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Inventory\StockTransfer;
use App\Models\Inventory\StockTransferItem;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StockTransferController extends BaseApiController
{
    /**
     * GET /api/v1/stock-transfers
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockTransfer::with(['fromWarehouse', 'toWarehouse', 'user', 'items.product', 'items.variant'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = trim($request->search);
                $lowerSearch = mb_strtolower($search);
                $q->where(function ($sq) use ($lowerSearch) {
                    $sq->whereRaw('LOWER(reference_number) LIKE ?', ["%{$lowerSearch}%"])
                       ->orWhereRaw('LOWER(notes) LIKE ?', ["%{$lowerSearch}%"])
                       ->orWhereHas('fromWarehouse', fn($wq) => $wq->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"]))
                       ->orWhereHas('toWarehouse', fn($wq) => $wq->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"]))
                       ->orWhereHas('items.product', fn($pq) => $pq->whereRaw('LOWER(name) LIKE ?', ["%{$lowerSearch}%"])->orWhereRaw('LOWER(sku) LIKE ?', ["%{$lowerSearch}%"]));
                });
            })
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->from_warehouse_id ?? $request->warehouse_id, function ($q, $w) {
                $q->where(function ($sq) use ($w) {
                    $sq->where('from_warehouse_id', $w)->orWhere('to_warehouse_id', $w);
                });
            })
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

        $transfers = $query->paginate($request->integer('per_page', 15));

        return $this->paginatedResponse($transfers);
    }

    /**
     * POST /api/v1/stock-transfers
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id'   => 'required|exists:warehouses,id|different:from_warehouse_id',
            'items'             => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity'   => 'required|numeric|min:0.0001',
            'notes'             => 'nullable|string',
        ]);

        $refNumber = \App\Services\Support\ReferenceNumberService::stockTransfer();

        $transfer = DB::transaction(function () use ($validated, $refNumber) {
            $tr = StockTransfer::create([
                'company_id'        => 1,
                'from_warehouse_id' => $validated['from_warehouse_id'],
                'to_warehouse_id'   => $validated['to_warehouse_id'],
                'user_id'           => Auth::id() ?? 1,
                'reference_number'  => $refNumber,
                'date'              => date('Y-m-d'),
                'notes'             => $validated['notes'] ?? '',
                'status'            => 'draft', // Starts as draft
            ]);

            foreach ($validated['items'] as $item) {
                StockTransferItem::create([
                    'stock_transfer_id'  => $tr->id,
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['variant_id'] ?? null,
                    'quantity_requested' => $item['quantity'],
                    'quantity_sent'      => 0,
                    'quantity_received'  => 0,
                    'notes'              => $validated['notes'] ?? null,
                ]);
            }

            return $tr;
        });

        return $this->successResponse($transfer, 'Stock transfer created as draft', 201);
    }

    /**
     * GET /api/v1/stock-transfers/{id}
     */
    public function show(int $id): JsonResponse
    {
        $transfer = StockTransfer::with(['fromWarehouse', 'toWarehouse', 'user', 'items.product', 'items.variant'])->findOrFail($id);
        return $this->successResponse($transfer);
    }

    /**
     * POST /api/v1/stock-transfers/{id}/ship
     */
    public function ship(int $id): JsonResponse
    {
        $transfer = StockTransfer::findOrFail($id);
        if ($transfer->status !== 'draft') {
            return $this->errorResponse('Only draft transfers can be shipped.');
        }

        DB::transaction(function () use ($transfer) {
            $transfer->update([
                'status'     => 'in_transit',
                'shipped_at' => now(),
            ]);

            foreach ($transfer->items as $item) {
                // Deduct from source warehouse
                $fromInv = Inventory::where([
                    'warehouse_id'       => $transfer->from_warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                ])->first();

                $fromBefore = $fromInv ? (float) $fromInv->quantity : 0.0;
                $fromAfter = $fromBefore - $item->quantity_requested;

                if ($fromInv) {
                    $fromInv->update(['quantity' => $fromAfter]);
                } else {
                    Inventory::create([
                        'company_id'         => 1,
                        'warehouse_id'       => $transfer->from_warehouse_id,
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity'           => $fromAfter,
                        'reserved_quantity'  => 0,
                    ]);
                }

                $item->update(['quantity_sent' => $item->quantity_requested]);

                // Record source movement (out)
                InventoryMovement::create([
                    'company_id'         => 1,
                    'warehouse_id'       => $transfer->from_warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'user_id'            => Auth::id() ?? 1,
                    'reference_type'     => StockTransfer::class,
                    'reference_id'       => $transfer->id,
                    'type'               => 'transfer_out',
                    'quantity'           => -$item->quantity_requested,
                    'quantity_before'    => $fromBefore,
                    'quantity_after'     => $fromAfter,
                    'notes'              => "Stock transfer transit: to warehouse " . $transfer->to_warehouse_id,
                ]);
            }
        });

        return $this->successResponse($transfer, 'Stock transfer is now in transit');
    }

    /**
     * POST /api/v1/stock-transfers/{id}/receive
     */
    public function receive(Request $request, int $id): JsonResponse
    {
        $transfer = StockTransfer::findOrFail($id);
        if ($transfer->status !== 'in_transit') {
            return $this->errorResponse('Only in-transit transfers can be received.');
        }

        $validated = $request->validate([
            'items' => 'nullable|array',
            'items.*.id' => 'required|exists:stock_transfer_items,id',
            'items.*.received_quantity' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($transfer, $validated) {
            $transfer->update([
                'status'      => 'received',
                'received_at' => now(),
            ]);

            $receivedMap = [];
            if (isset($validated['items'])) {
                foreach ($validated['items'] as $it) {
                    $receivedMap[$it['id']] = (float) $it['received_quantity'];
                }
            }

            foreach ($transfer->items as $item) {
                $qtyReceived = isset($receivedMap[$item->id]) ? $receivedMap[$item->id] : $item->quantity_sent;

                // Add to destination warehouse
                $toInv = Inventory::where([
                    'warehouse_id'       => $transfer->to_warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                ])->first();

                $toBefore = $toInv ? (float) $toInv->quantity : 0.0;
                $toAfter = $toBefore + $qtyReceived;

                if ($toInv) {
                    $toInv->update(['quantity' => $toAfter]);
                } else {
                    Inventory::create([
                        'company_id'         => 1,
                        'warehouse_id'       => $transfer->to_warehouse_id,
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity'           => $toAfter,
                        'reserved_quantity'  => 0,
                    ]);
                }

                $item->update(['quantity_received' => $qtyReceived]);

                // Record destination movement (in)
                InventoryMovement::create([
                    'company_id'         => 1,
                    'warehouse_id'       => $transfer->to_warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'user_id'            => Auth::id() ?? 1,
                    'reference_type'     => StockTransfer::class,
                    'reference_id'       => $transfer->id,
                    'type'               => 'transfer_in',
                    'quantity'           => $qtyReceived,
                    'quantity_before'    => $toBefore,
                    'quantity_after'     => $toAfter,
                    'notes'              => "Stock transfer received: from warehouse " . $transfer->from_warehouse_id,
                ]);
            }
        });

        return $this->successResponse($transfer, 'Stock transfer received and stock updated');
    }

    /**
     * DELETE /api/v1/stock-transfers/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $transfer = StockTransfer::findOrFail($id);
        $transfer->delete();
        return $this->successResponse(null, 'Stock transfer soft deleted successfully');
    }

    /**
     * POST /api/v1/stock-transfers/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        $transfer = StockTransfer::onlyTrashed()->findOrFail($id);
        $transfer->restore();
        return $this->successResponse($transfer, 'Stock transfer restored successfully');
    }

    /**
     * DELETE /api/v1/stock-transfers/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        $transfer = StockTransfer::onlyTrashed()->findOrFail($id);
        $transfer->forceDelete();
        return $this->successResponse(null, 'Stock transfer permanently deleted');
    }

    /**
     * POST /api/v1/stock-transfers/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        StockTransfer::whereIn('id', $request->ids)->delete();
        return $this->successResponse(null, 'Selected transfers soft deleted');
    }

    /**
     * POST /api/v1/stock-transfers/bulk-restore
     */
    public function bulkRestore(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        StockTransfer::onlyTrashed()->whereIn('id', $request->ids)->restore();
        return $this->successResponse(null, 'Selected transfers restored');
    }

    /**
     * GET /api/v1/stock-transfers/export
     */
    public function export(Request $request)
    {
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=stock_transfers_" . date('Ymd_His') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Reference Number', 'Date', 'From Warehouse', 'To Warehouse', 'Status', 'Notes']);

            StockTransfer::with(['fromWarehouse', 'toWarehouse'])
                ->chunk(100, function($transfers) use ($file) {
                    foreach ($transfers as $tr) {
                        fputcsv($file, [
                            $tr->id,
                            $tr->reference_number,
                            $tr->date,
                            $tr->fromWarehouse ? $tr->fromWarehouse->name : 'N/A',
                            $tr->toWarehouse ? $tr->toWarehouse->name : 'N/A',
                            $tr->status,
                            $tr->notes
                        ]);
                    }
                });
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
