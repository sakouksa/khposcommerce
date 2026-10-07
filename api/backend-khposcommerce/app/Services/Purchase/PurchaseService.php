<?php

namespace App\Services\Purchase;

use App\Repositories\Purchase\PurchaseRepository;
use App\Models\Purchase\Purchase;
use App\Models\Purchase\PurchaseItem;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use App\Models\Product\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;

class PurchaseService
{
    public function __construct(private readonly PurchaseRepository $repository)
    {
    }

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Purchase::with(['supplier', 'warehouse', 'branch', 'creator'])->withCount('items');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (!empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        $sortBy = $filters['sort_by'] ?? 'id';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    public function createPurchase(array $data): Purchase
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'];
            unset($data['items']);

            // Generate unique reference number
            $data['reference_number'] = \App\Services\Support\ReferenceNumberService::purchaseOrder();
            $data['user_id'] = Auth::id() ?? 1;
            $data['status'] = $data['status'] ?? 'ordered';
            $data['payment_status'] = 'unpaid';

            $rate = (float)($data['exchange_rate'] ?? 1);

            // Calculations
            $subtotal = 0;
            $taxAmount = 0;
            $discountAmount = 0;

            $itemsToCreate = [];
            foreach ($items as $item) {
                $qty = (float)$item['quantity'];
                $cost = (float)$item['unit_cost'];
                
                $discPercent = (float)($item['discount_percent'] ?? 0);
                $discAmt = ($qty * $cost) * ($discPercent / 100);
                
                $taxPercent = (float)($item['tax_percent'] ?? 0);
                $taxAmt = (($qty * $cost) - $discAmt) * ($taxPercent / 100);

                $itemSubtotal = $qty * $cost;
                $itemTotal = $itemSubtotal - $discAmt + $taxAmt;

                $subtotal += $itemSubtotal;
                $discountAmount += $discAmt;
                $taxAmount += $taxAmt;

                $pName = $item['product_name'] ?? Product::where('id', $item['product_id'])->value('name') ?? 'Unknown Product';
                $pSku = Product::where('id', $item['product_id'])->value('sku') ?? '';

                $itemsToCreate[] = [
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'product_name'       => $pName,
                    'product_sku'        => $pSku,
                    'quantity'           => $qty,
                    'quantity_received'  => 0,
                    'unit_cost'          => $cost,
                    'discount_percent'   => $discPercent,
                    'discount_amount'    => $discAmt,
                    'tax_percent'        => $taxPercent,
                    'tax_amount'         => $taxAmt,
                    'subtotal'           => $itemSubtotal,
                    'total'              => $itemTotal,
                    'notes'              => $item['notes'] ?? null,
                    'currency_code'      => $data['currency_code'] ?? 'USD',
                    'exchange_rate'      => $rate,
                    'unit_cost_base'     => $cost * $rate,
                    'subtotal_base'      => $itemSubtotal * $rate,
                    'total_base'         => $itemTotal * $rate,
                ];
            }

            $shippingCost = (float)($data['shipping_cost'] ?? 0);
            $grandTotal = $subtotal - $discountAmount + $taxAmount + $shippingCost;

            $data['subtotal']             = $subtotal;
            $data['discount_amount']      = $discountAmount;
            $data['tax_amount']           = $taxAmount;
            $data['grand_total']          = $grandTotal;
            
            $initialPaid                  = (float)($data['paid_amount'] ?? 0);
            $data['paid_amount']          = $initialPaid;
            $data['due_amount']           = max(0, $grandTotal - $initialPaid);
            $data['payment_status']       = Purchase::derivePaymentStatus($initialPaid, $grandTotal);

            // Base KHR currency fields
            $data['subtotal_base']        = $subtotal * $rate;
            $data['discount_amount_base'] = $discountAmount * $rate;
            $data['tax_amount_base']      = $taxAmount * $rate;
            $data['shipping_cost_base']   = $shippingCost * $rate;
            $data['grand_total_base']     = $grandTotal * $rate;
            $data['paid_amount_base']     = $initialPaid * $rate;
            $data['due_amount_base']      = max(0, $grandTotal - $initialPaid) * $rate;

            $purchase = Purchase::create($data);

            foreach ($itemsToCreate as $itemData) {
                $purchase->items()->create($itemData);
            }

            // Auto-receive stock when purchase is created directly as 'received'
            if ($purchase->status === 'received') {
                $purchase->load('items');
                $this->applyStockUpdate($purchase, $purchase->items->all());
            }

            return $purchase;
        });
    }

    public function updatePurchase(int $id, array $data): Purchase
    {
        return DB::transaction(function () use ($id, $data) {
            $purchase = Purchase::findOrFail($id);

            if ($purchase->status === 'received') {
                throw new \Exception('Received purchases cannot be updated.');
            }

            $items = $data['items'] ?? null;
            unset($data['items']);

            $rate = (float)($data['exchange_rate'] ?? $purchase->exchange_rate ?? 1);

            if ($items !== null) {
                // Delete old items
                $purchase->items()->delete();

                // Calculations
                $subtotal = 0;
                $taxAmount = 0;
                $discountAmount = 0;

                foreach ($items as $item) {
                    $qty = (float)$item['quantity'];
                    $cost = (float)$item['unit_cost'];
                    
                    $discPercent = (float)($item['discount_percent'] ?? 0);
                    $discAmt = ($qty * $cost) * ($discPercent / 100);
                    
                    $taxPercent = (float)($item['tax_percent'] ?? 0);
                    $taxAmt = (($qty * $cost) - $discAmt) * ($taxPercent / 100);

                    $itemSubtotal = $qty * $cost;
                    $itemTotal = $itemSubtotal - $discAmt + $taxAmt;

                    $subtotal += $itemSubtotal;
                    $discountAmount += $discAmt;
                    $taxAmount += $taxAmt;

                    $pName = $item['product_name'] ?? Product::where('id', $item['product_id'])->value('name') ?? 'Unknown Product';
                    $pSku = Product::where('id', $item['product_id'])->value('sku') ?? '';

                    $purchase->items()->create([
                        'product_id'         => $item['product_id'],
                        'product_variant_id' => $item['product_variant_id'] ?? null,
                        'product_name'       => $pName,
                        'product_sku'        => $pSku,
                        'quantity'           => $qty,
                        'quantity_received'  => 0,
                        'unit_cost'          => $cost,
                        'discount_percent'   => $discPercent,
                        'discount_amount'    => $discAmt,
                        'tax_percent'        => $taxPercent,
                        'tax_amount'         => $taxAmt,
                        'subtotal'           => $itemSubtotal,
                        'total'              => $itemTotal,
                        'notes'              => $item['notes'] ?? null,
                        'currency_code'      => $data['currency_code'] ?? $purchase->currency_code,
                        'exchange_rate'      => $rate,
                        'unit_cost_base'     => $cost * $rate,
                        'subtotal_base'      => $itemSubtotal * $rate,
                        'total_base'         => $itemTotal * $rate,
                    ]);
                }

                $shippingCost = (float)($data['shipping_cost'] ?? $purchase->shipping_cost);
                $grandTotal = $subtotal - $discountAmount + $taxAmount + $shippingCost;

                $data['subtotal']       = $subtotal;
                $data['discount_amount'] = $discountAmount;
                $data['tax_amount']      = $taxAmount;
                $data['grand_total']     = $grandTotal;
                $data['due_amount']      = max(0, $grandTotal - $purchase->paid_amount);
                $data['payment_status']  = Purchase::derivePaymentStatus(
                    (float)$purchase->paid_amount,
                    $grandTotal
                );

                // Base KHR currency fields
                $data['subtotal_base']        = $subtotal * $rate;
                $data['discount_amount_base'] = $discountAmount * $rate;
                $data['tax_amount_base']      = $taxAmount * $rate;
                $data['shipping_cost_base']   = $shippingCost * $rate;
                $data['grand_total_base']     = $grandTotal * $rate;
                $data['paid_amount_base']     = (float)$purchase->paid_amount * $rate;
                $data['due_amount_base']      = max(0, $grandTotal - (float)$purchase->paid_amount) * $rate;
            }

            $oldStatus = $purchase->status;
            $purchase->update($data);

            if ($purchase->status === 'received' && $oldStatus !== 'received') {
                $purchase->load('items');
                $this->applyStockUpdate($purchase, $purchase->items->all());
            }

            return $purchase;
        });
    }

    /**
     * Apply inventory stock updates for all items in a purchase.
     * Sets quantity_received = quantity and logs inventory movements.
     */
    private function applyStockUpdate(Purchase $purchase, array $items): void
    {
        foreach ($items as $item) {
            $qtyToReceive = (float)$item->quantity - (float)$item->quantity_received;
            if ($qtyToReceive <= 0) {
                continue;
            }

            $item->update(['quantity_received' => (float)$item->quantity]);

            $inventory = Inventory::firstOrCreate(
                [
                    'company_id'         => $purchase->company_id,
                    'warehouse_id'       => $purchase->warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id ?? null,
                ],
                [
                    'quantity'          => 0,
                    'reserved_quantity' => 0,
                    'reorder_point'     => 5,
                    'reorder_qty'       => 10,
                ]
            );

            $qtyBefore = (float)$inventory->quantity;
            $qtyAfter  = $qtyBefore + $qtyToReceive;

            $inventory->update(['quantity' => $qtyAfter]);

            InventoryMovement::create([
                'company_id'         => $purchase->company_id,
                'warehouse_id'       => $purchase->warehouse_id,
                'product_id'         => $item->product_id,
                'product_variant_id' => $item->product_variant_id ?? null,
                'user_id'            => Auth::id() ?? 1,
                'reference_type'     => Purchase::class,
                'reference_id'       => $purchase->id,
                'type'               => 'purchase',
                'quantity'           => $qtyToReceive,
                'quantity_before'    => $qtyBefore,
                'quantity_after'     => $qtyAfter,
                'unit_cost'          => $item->unit_cost_base,
                'notes'              => "Direct receive for PO #{$purchase->reference_number}",
            ]);
        }
    }

    public function receivePurchase(int $id, array $data): array
    {
        return DB::transaction(function () use ($id, $data) {
            $purchase = Purchase::findOrFail($id);

            if ($purchase->status === 'received' || $purchase->status === 'cancelled') {
                throw new \Exception('Purchase order is already received or cancelled.');
            }

            $anyReceived = false;
            $updatedInventories = [];
            $inventoryMovements = [];

            foreach ($data['items'] as $recv) {
                $item = PurchaseItem::findOrFail($recv['purchase_item_id']);
                $qtyToReceive = (float)$recv['quantity_received'];

                if ($qtyToReceive <= 0) {
                    continue;
                }

                $newReceived = $item->quantity_received + $qtyToReceive;

                if ($newReceived > $item->quantity) {
                    $productName = $item->product->name ?? "ID #{$item->product_id}";
                    throw new \Exception("Cannot receive more than ordered quantity for product: {$productName}");
                }

                $item->update(['quantity_received' => $newReceived]);

                // Update stock inventory
                $inventory = Inventory::firstOrCreate(
                    [
                        'company_id'         => $purchase->company_id,
                        'warehouse_id'       => $purchase->warehouse_id,
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id ?? null,
                    ],
                    [
                        'quantity'           => 0,
                        'reserved_quantity'  => 0,
                        'reorder_point'      => 5,
                        'reorder_qty'        => 10,
                    ]
                );

                $qtyBefore = (float)$inventory->quantity;
                $qtyAfter = $qtyBefore + $qtyToReceive;

                $inventory->update(['quantity' => $qtyAfter]);
                $updatedInventories[] = $inventory->load(['product', 'warehouse']);

                // Log movement
                $movement = InventoryMovement::create([
                    'company_id'         => $purchase->company_id,
                    'warehouse_id'       => $purchase->warehouse_id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id ?? null,
                    'user_id'            => Auth::id() ?? 1,
                    'reference_type'     => Purchase::class,
                    'reference_id'       => $purchase->id,
                    'type'               => 'purchase',
                    'quantity'           => $qtyToReceive,
                    'quantity_before'    => $qtyBefore,
                    'quantity_after'     => $qtyAfter,
                    'unit_cost'          => $item->unit_cost_base,
                    'notes'              => "Goods Received Note for PO #{$purchase->reference_number}",
                ]);
                $inventoryMovements[] = $movement->load(['product', 'warehouse']);

                $anyReceived = true;
            }

            // Check overall status
            $status = $purchase->status;
            if ($anyReceived) {
                // Reload items freshly from database to get updated quantity_received
                $purchase->load('items');
                $fullyReceived = true;
                foreach ($purchase->items as $pi) {
                    if ((float)$pi->quantity_received < (float)$pi->quantity) {
                        $fullyReceived = false;
                        break;
                    }
                }
                $status = $fullyReceived ? 'received' : 'partial';
            }

            $purchase->update([
                'status' => $status
            ]);

            $purchase->refresh();
            $purchase->load(['supplier', 'warehouse', 'branch', 'creator', 'items.product.primaryImage', 'items.product.images', 'items.product.category', 'items.variant', 'returns']);

            return [
                'purchase'            => $purchase,
                'updated_inventory'   => $updatedInventories,
                'inventory_movements' => $inventoryMovements,
            ];
        });
    }

    public function cancelPurchase(int $id): Purchase
    {
        return DB::transaction(function () use ($id) {
            $purchase = Purchase::findOrFail($id);

            if ($purchase->status === 'received' || $purchase->status === 'partial') {
                throw new \Exception('Received or partially received purchases cannot be cancelled.');
            }

            $purchase->update(['status' => 'cancelled']);

            return $purchase;
        });
    }

    /**
     * Record a payment against a purchase order.
     * Adds the payment amount on top of any existing paid_amount,
     * recalculates due_amount, and derives the new payment_status.
     */
    public function recordPayment(int $id, float $amount, ?string $notes = null): Purchase
    {
        return DB::transaction(function () use ($id, $amount, $notes) {
            $purchase = Purchase::findOrFail($id);

            if ($purchase->status === 'cancelled') {
                throw new \Exception('Cannot record payment for a cancelled purchase order.');
            }

            if ($amount <= 0) {
                throw new \Exception('Payment amount must be greater than zero.');
            }

            $newPaid  = (float)$purchase->paid_amount + $amount;
            $newDue   = max(0, (float)$purchase->grand_total - $newPaid);
            $newStatus = Purchase::derivePaymentStatus($newPaid, (float)$purchase->grand_total);

            $rate = (float)($purchase->exchange_rate ?? 1);

            $purchase->update([
                'paid_amount'      => $newPaid,
                'due_amount'       => $newDue,
                'payment_status'   => $newStatus,
                'paid_amount_base' => $newPaid * $rate,
                'due_amount_base'  => $newDue * $rate,
            ]);

            return $purchase->fresh();
        });
    }
}
