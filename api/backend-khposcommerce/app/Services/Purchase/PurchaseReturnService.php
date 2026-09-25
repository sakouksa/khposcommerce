<?php

namespace App\Services\Purchase;

use App\Repositories\Purchase\PurchaseReturnRepository;
use App\Models\Purchase\Purchase;
use App\Models\Purchase\PurchaseItem;
use App\Models\Purchase\PurchaseReturn;
use App\Models\Purchase\PurchaseReturnItem;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PurchaseReturnService
{
    public function __construct(private readonly PurchaseReturnRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $relations = []): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, relations: $relations);
    }

    public function getById(int|string $id, array $relations = []): PurchaseReturn
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function createReturn(array $data): PurchaseReturn
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'];
            unset($data['items']);

            $purchase = Purchase::findOrFail($data['purchase_id']);

            $data['company_id'] = $purchase->company_id;
            $data['supplier_id'] = $purchase->supplier_id;
            $data['user_id'] = Auth::id() ?? 1;
            $data['reference_number'] = \App\Services\Support\ReferenceNumberService::purchaseReturn();
            $data['date'] = $data['date'] ?? now()->toDateString();
            $data['status'] = $data['status'] ?? 'draft';

            // Multi-currency handling
            $currencyCode = $purchase->currency_code ?? 'USD';
            $exchangeRate = (float)($purchase->exchange_rate ?? 1);
            if ($exchangeRate <= 0) $exchangeRate = 1.0;

            $data['currency_code'] = $currencyCode;
            $data['exchange_rate'] = $exchangeRate;
            $data['refund_status'] = 'pending';

            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($items as $item) {
                $purchaseItem = PurchaseItem::findOrFail($item['purchase_item_id']);
                $qty = (float)$item['quantity'];

                // Calculate already returned amount across active/approved returns
                $alreadyReturned = PurchaseReturnItem::where('purchase_item_id', $purchaseItem->id)
                    ->whereHas('purchaseReturn', function ($query) {
                        $query->whereIn('status', ['approved', 'shipped', 'completed']);
                    })->sum('quantity');

                // If quantity_received is recorded and > 0, use it; otherwise fall back to purchased quantity
                $effectiveReceived = (float)$purchaseItem->quantity_received > 0
                    ? (float)$purchaseItem->quantity_received
                    : (float)$purchaseItem->quantity;

                $available = $effectiveReceived - (float)$alreadyReturned;

                if ($qty > $available) {
                    $productName = $purchaseItem->product->name ?? "Product #{$purchaseItem->product_id}";
                    throw new \Exception("Returned quantity ({$qty}) cannot exceed available return quantity ({$available}) for product: {$productName}");
                }

                $cost = (float)$item['unit_cost'];
                $itemTotal = $qty * $cost;
                $costBase = $cost * $exchangeRate;
                $totalBase = $itemTotal * $exchangeRate;

                $totalAmount += $itemTotal;

                $itemsToCreate[] = [
                    'purchase_item_id'   => $item['purchase_item_id'],
                    'product_id'         => $purchaseItem->product_id,
                    'product_variant_id' => $purchaseItem->product_variant_id ?? null,
                    'batch_number'       => $item['batch_number'] ?? null,
                    'serial_number'      => $item['serial_number'] ?? null,
                    'quantity'           => $qty,
                    'unit_cost'          => $cost,
                    'total'              => $itemTotal,
                    'unit_cost_base'     => $costBase,
                    'total_base'         => $totalBase,
                    'notes'              => $item['notes'] ?? null,
                ];
            }

            $data['total_amount'] = $totalAmount;
            $data['total_amount_base'] = $totalAmount * $exchangeRate;
            
            $return = PurchaseReturn::create($data);

            foreach ($itemsToCreate as $itemData) {
                $return->items()->create($itemData);
            }

            return $return;
        });
    }

    public function approveReturn(int $id): PurchaseReturn
    {
        return DB::transaction(function () use ($id) {
            $return = PurchaseReturn::with(['items', 'purchase'])->findOrFail($id);

            if ($return->status !== 'draft') {
                throw new \Exception('Only draft returns can be approved.');
            }

            $purchase = $return->purchase;

            // 1. Update Inventory and movements
            foreach ($return->items as $item) {
                $inventory = Inventory::where([
                    'company_id'         => $return->company_id,
                    'warehouse_id'       => $purchase->warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id ?? null,
                ])->first();

                if (!$inventory || $inventory->quantity < $item->quantity) {
                    throw new \Exception("Insufficient stock in warehouse to process return for product ID: {$item->product_id}");
                }

                $qtyBefore = (float)$inventory->quantity;
                $qtyAfter = $qtyBefore - (float)$item->quantity;

                $inventory->update(['quantity' => $qtyAfter]);

                // Log movement
                InventoryMovement::create([
                    'company_id'         => $return->company_id,
                    'warehouse_id'       => $purchase->warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id ?? null,
                    'user_id'            => Auth::id() ?? 1,
                    'reference_type'     => PurchaseReturn::class,
                    'reference_id'       => $return->id,
                    'type'               => 'out',
                    'quantity'           => $item->quantity,
                    'quantity_before'    => $qtyBefore,
                    'quantity_after'     => $qtyAfter,
                    'unit_cost'          => $item->unit_cost,
                    'notes'              => "Goods Return to Supplier (Return #{$return->reference_number})",
                ]);
            }

            // 2. Financial & Accounts Payable (AP) Sync
            $returnTotal = (float)$return->total_amount;
            $returnTotalBase = (float)($return->total_amount_base ?? $returnTotal);

            if ((float)$purchase->due_amount > 0) {
                // Deduct from outstanding due balance
                $offsetAmount = min((float)$purchase->due_amount, $returnTotal);
                $offsetAmountBase = min((float)$purchase->due_amount_base, $returnTotalBase);

                $purchase->due_amount = max(0, (float)$purchase->due_amount - $offsetAmount);
                $purchase->due_amount_base = max(0, (float)$purchase->due_amount_base - $offsetAmountBase);
                $purchase->payment_status = Purchase::derivePaymentStatus((float)$purchase->paid_amount, (float)$purchase->grand_total);
                $purchase->save();

                $return->refund_status = 'offset';
                $return->refund_method = 'offset_invoice';
                $return->refund_amount = $offsetAmount;
                $return->refund_date = now()->toDateString();
                $return->settlement_notes = "Automatically offset $" . number_format($offsetAmount, 2) . " against PO #{$purchase->reference_number} outstanding balance.";
            } else {
                // If PO was already fully paid, track as pending supplier credit / refund
                $return->refund_status = 'pending';
            }

            $return->status = 'approved';
            $return->save();

            return $return;
        });
    }

    public function shipReturn(int $id, array $data): PurchaseReturn
    {
        return DB::transaction(function () use ($id, $data) {
            $return = PurchaseReturn::findOrFail($id);

            if (!in_array($return->status, ['draft', 'approved'])) {
                throw new \Exception("Return cannot be marked as shipped from status '{$return->status}'.");
            }

            // If it was draft, automatically approve first
            if ($return->status === 'draft') {
                $this->approveReturn($id);
                $return->refresh();
            }

            $return->update([
                'status'           => 'shipped',
                'shipping_carrier' => $data['shipping_carrier'] ?? $return->shipping_carrier,
                'tracking_number'  => $data['tracking_number'] ?? $return->tracking_number,
            ]);

            return $return;
        });
    }

    public function settleRefund(int $id, array $data): PurchaseReturn
    {
        return DB::transaction(function () use ($id, $data) {
            $return = PurchaseReturn::findOrFail($id);

            $refundStatus = $data['refund_status'] ?? 'refunded';
            $refundMethod = $data['refund_method'] ?? 'credit_note';
            $refundAmount = (float)($data['refund_amount'] ?? $return->total_amount);
            $refundDate = $data['refund_date'] ?? now()->toDateString();
            $settlementNotes = $data['settlement_notes'] ?? null;

            $return->update([
                'refund_status'    => $refundStatus,
                'refund_method'    => $refundMethod,
                'refund_amount'    => $refundAmount,
                'refund_date'      => $refundDate,
                'settlement_notes' => $settlementNotes,
                'status'           => 'completed',
            ]);

            return $return;
        });
    }

    public function cancelReturn(int $id): PurchaseReturn
    {
        return DB::transaction(function () use ($id) {
            $return = PurchaseReturn::with(['items', 'purchase'])->findOrFail($id);

            if ($return->status === 'cancelled') {
                throw new \Exception('Return is already cancelled.');
            }

            $purchase = $return->purchase;

            if (in_array($return->status, ['approved', 'shipped', 'completed'])) {
                // 1. Rollback stock
                foreach ($return->items as $item) {
                    $inventory = Inventory::where([
                        'company_id'         => $return->company_id,
                        'warehouse_id'       => $purchase->warehouse_id,
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id ?? null,
                    ])->first();

                    if (!$inventory) {
                        $inventory = Inventory::create([
                            'company_id'         => $return->company_id,
                            'warehouse_id'       => $purchase->warehouse_id,
                            'product_id'         => $item->product_id,
                            'product_variant_id' => $item->product_variant_id ?? null,
                            'quantity'           => 0,
                            'reserved_quantity'  => 0,
                        ]);
                    }

                    $qtyBefore = (float)$inventory->quantity;
                    $qtyAfter = $qtyBefore + (float)$item->quantity;

                    $inventory->update(['quantity' => $qtyAfter]);

                    // Log rollback movement
                    InventoryMovement::create([
                        'company_id'         => $return->company_id,
                        'warehouse_id'       => $purchase->warehouse_id,
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id ?? null,
                        'user_id'            => Auth::id() ?? 1,
                        'reference_type'     => PurchaseReturn::class,
                        'reference_id'       => $return->id,
                        'type'               => 'in',
                        'quantity'           => $item->quantity,
                        'quantity_before'    => $qtyBefore,
                        'quantity_after'     => $qtyAfter,
                        'unit_cost'          => $item->unit_cost,
                        'notes'              => "Rollback: Cancelled Return #{$return->reference_number}",
                    ]);
                }

                // 2. Financial AP Rollback (restore due amount if it was offset or deducted)
                if ((float)$return->refund_amount > 0 && $purchase) {
                    $refundOffset = (float)$return->refund_amount;
                    $refundOffsetBase = $refundOffset * (float)($purchase->exchange_rate ?? 1);

                    $purchase->due_amount = (float)$purchase->due_amount + $refundOffset;
                    $purchase->due_amount_base = (float)$purchase->due_amount_base + $refundOffsetBase;
                    $purchase->payment_status = Purchase::derivePaymentStatus((float)$purchase->paid_amount, (float)$purchase->grand_total);
                    $purchase->save();
                }
            }

            $return->update([
                'status'        => 'cancelled',
                'refund_status' => 'cancelled',
            ]);

            return $return;
        });
    }

    public function update(int|string $id, array $data): PurchaseReturn
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $return = PurchaseReturn::with(['items', 'purchase'])->findOrFail($id);

            if (in_array($return->status, ['approved', 'shipped', 'completed'])) {
                // Rollback stock and financial state before soft delete
                $this->cancelReturn($id);
                $return->refresh();
            }

            // Perform Soft Delete
            return (bool)$return->delete();
        });
    }

    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $count = 0;
            foreach ($ids as $id) {
                if ($this->delete($id)) {
                    $count++;
                }
            }
            return $count;
        });
    }
}
