<?php

namespace App\Services\Purchase\Actions;

use App\Services\Inventory\InventoryService;
use App\Models\Purchase\Purchase;
use Illuminate\Support\Facades\DB;
use Exception;

class ReceivePurchaseAction
{
    public function __construct(private readonly InventoryService $inventoryService)
    {
    }

    /**
     * Receive a purchase order, update received quantities, and increment warehouse inventory.
     */
    public function execute(Purchase $purchase, array $receivedItems = [], ?string $notes = null): Purchase
    {
        return DB::transaction(function () use ($purchase, $receivedItems, $notes) {
            $companyId   = $purchase->company_id;
            $warehouseId = $purchase->warehouse_id;

            foreach ($purchase->items as $item) {
                // Determine quantity received for this item
                $qtyToReceive = 0.0;
                if (isset($receivedItems[$item->id])) {
                    $qtyToReceive = (float) $receivedItems[$item->id];
                } elseif (!empty($receivedItems)) {
                    foreach ($receivedItems as $r) {
                        if (is_array($r) && ($r['item_id'] ?? null) == $item->id) {
                            $qtyToReceive = (float) ($r['quantity_received'] ?? $r['quantity'] ?? $item->quantity);
                            break;
                        }
                    }
                } else {
                    $qtyToReceive = (float) $item->quantity;
                }

                if ($qtyToReceive > 0) {
                    $item->quantity_received = (float) ($item->quantity_received ?? 0) + $qtyToReceive;
                    $item->save();

                    // Adjust physical inventory using service
                    $this->inventoryService->adjustStock(
                        companyId: $companyId,
                        warehouseId: $warehouseId,
                        productId: $item->product_id,
                        variantId: $item->product_variant_id,
                        qtyChange: $qtyToReceive,
                        movementType: 'in',
                        referenceType: Purchase::class,
                        referenceId: $purchase->id,
                        unitCost: (float) $item->unit_cost,
                        notes: $notes ?: "Received from PO #{$purchase->reference_number}",
                        userId: auth()->id()
                    );
                }
            }

            // Update PO Status
            $purchase->status = 'received';
            if ($notes) {
                $purchase->notes = ($purchase->notes ? $purchase->notes . "\n" : '') . "Received on " . now()->toDateTimeString() . ": {$notes}";
            }
            $purchase->save();

            return $purchase->fresh(['items', 'supplier', 'warehouse']);
        });
    }
}
