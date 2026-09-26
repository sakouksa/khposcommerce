<?php

namespace App\Services\OrderReturn;

use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\OrderReturn;
use App\Models\Order\OrderReturnItem;
use App\Models\Order\ReturnShipment;
use App\Models\Order\ReturnInspection;
use App\Models\Order\ReturnInspectionItem;
use App\Models\Order\ExchangeOrder;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use App\Models\Product\Product;
use App\Models\Sales\Sale;
use App\Services\Customer\CustomerWalletService;
use App\Services\Support\ReferenceNumberService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OrderReturnService
{
    public function __construct(
        private readonly ReturnPolicyEngineService $policyEngine,
        private readonly ReturnFinancialCalculatorService $financialCalculator,
        private readonly CustomerWalletService $walletService
    ) {
    }

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = OrderReturn::with([
            'order',
            'sale',
            'customer',
            'warehouse',
            'items.product.primaryImage',
            'items.product.images',
            'items.product.category',
            'items.variant',
            'latestShipment',
            'latestInspection.items',
            'exchangeOrder',
            'approvedBy',
        ]);

        if (!empty($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (!empty($filters['fault'])) {
            $query->where('fault', $filters['fault']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('return_number', 'ilike', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'ilike', "%{$search}%")
                         ->orWhere('phone', 'ilike', "%{$search}%");
                  })
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'ilike', "%{$search}%");
                  });
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function getById(int $id): OrderReturn
    {
        return OrderReturn::with([
            'order.items.product.primaryImage',
            'sale.items.product.primaryImage',
            'customer.defaultAddress',
            'warehouse',
            'items.product.primaryImage',
            'items.product.images',
            'items.product.category',
            'items.variant',
            'shipments.shippingMethod',
            'inspections.items.orderReturnItem.product.primaryImage',
            'inspections.inspector',
            'exchangeOrder.replacementOrder',
            'approvedBy',
        ])->findOrFail($id);
    }

    /**
     * Create a new Return / Exchange Request with policy and financial calculation.
     */
    public function createReturn(array $data): OrderReturn
    {
        return DB::transaction(function () use ($data) {
            $order = null;
            $sale = null;

            if (!empty($data['order_id'])) {
                $order = Order::with(['items.product.category', 'shipment'])->findOrFail($data['order_id']);
                $companyId = $order->company_id;
                $customerId = $order->customer_id;
                $warehouseId = $data['warehouse_id'] ?? $order->warehouse_id;
                $currencyCode = $order->currency_code ?? 'USD';
                $exchangeRate = (float)($order->exchange_rate ?? 1.0);
            } elseif (!empty($data['sale_id'])) {
                $sale = Sale::with('items.product.category')->findOrFail($data['sale_id']);
                $companyId = $sale->company_id;
                $customerId = $sale->customer_id;
                $warehouseId = $data['warehouse_id'] ?? $sale->warehouse_id;
                $currencyCode = 'USD';
                $exchangeRate = 1.0;
            } else {
                throw new \Exception('Either order_id or sale_id must be provided.');
            }

            $fault = strtolower($data['fault'] ?? 'customer');
            $returnType = $data['type'] ?? 'return'; // 'return' or 'exchange'

            // Check eligibility for each item if order is present
            if ($order) {
                foreach ($data['items'] as $itemInput) {
                    $orderItem = OrderItem::with('product.category')->findOrFail($itemInput['order_item_id']);
                    $eligibility = $this->policyEngine->evaluateEligibility($order, $orderItem);

                    if (!$eligibility['eligible']) {
                        throw new \Exception("Product '{$orderItem->product_name}' cannot be returned: {$eligibility['reason']}");
                    }
                }
            }

            // Calculate pro-rata financial distribution
            $financials = $order
                ? $this->financialCalculator->calculateReturnFinancials(
                    $order,
                    $data['items'],
                    $fault,
                    [
                        'restocking_fee'      => $data['restocking_fee'] ?? 0,
                        'return_shipping_fee' => $data['return_shipping_fee'] ?? 0,
                    ]
                )
                : $this->calculatePosReturnFinancials($sale, $data['items'], $fault);

            $returnNumber = 'RMA-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));

            $channel = $data['channel'] ?? ($order ? 'web' : 'pos');

            $orderReturn = OrderReturn::create([
                'company_id'                => $companyId,
                'order_id'                  => $order?->id,
                'sale_id'                   => $sale?->id,
                'customer_id'               => $customerId,
                'warehouse_id'              => $warehouseId,
                'return_number'             => $returnNumber,
                'type'                      => $returnType,
                'channel'                   => $channel,
                'fault'                     => $fault,
                'reason_code'               => $data['reason_code'],
                'reason_notes'              => $data['reason_notes'] ?? null,
                'status'                    => $channel === 'pos' ? 'received' : 'requested',
                'currency_code'             => $currencyCode,
                'exchange_rate'             => $exchangeRate,
                'subtotal_amount'           => $financials['subtotal_amount'],
                'allocated_discount_amount' => $financials['allocated_discount_amount'],
                'tax_amount'                => $financials['tax_amount'],
                'restocking_fee'            => $financials['restocking_fee'],
                'return_shipping_fee'       => $financials['return_shipping_fee'],
                'total_refund_amount'       => $financials['total_refund_amount'],
                'refund_status'             => 'pending',
                'refund_method'             => $data['refund_method'] ?? 'original_payment',
                'refund_account_info'       => $data['refund_account_info'] ?? null,
                'expires_at'                => now()->addDays(7), // Auto-expire window to ship
                'admin_notes'               => $data['admin_notes'] ?? null,
            ]);

            // Save items
            foreach ($financials['items'] as $itemData) {
                $orderReturn->items()->create($itemData);
            }

            // If POS channel, immediately approved
            if (($data['channel'] ?? '') === 'pos') {
                $orderReturn->update([
                    'status'      => 'approved',
                    'approved_by' => Auth::id() ?? 1,
                    'approved_at' => now(),
                ]);
            }

            return $orderReturn->fresh(['items']);
        });
    }

    /**
     * Helper for POS sales return financials.
     */
    private function calculatePosReturnFinancials(Sale $sale, array $itemsInput, string $fault): array
    {
        $calculatedItems = [];
        $totalSubtotal = 0;

        foreach ($itemsInput as $input) {
            $saleItem = \App\Models\Sales\SaleItem::findOrFail($input['sale_item_id']);
            $qty = (float)$input['quantity'];
            $unitPrice = (float)$saleItem->unit_price;
            $lineSubtotal = round($qty * $unitPrice, 2);
            $totalSubtotal += $lineSubtotal;

            $calculatedItems[] = [
                'sale_item_id'           => $saleItem->id,
                'product_id'             => $saleItem->product_id,
                'product_variant_id'     => $saleItem->product_variant_id,
                'quantity_requested'     => $qty,
                'unit_price'             => $unitPrice,
                'line_subtotal'          => $lineSubtotal,
                'allocated_discount'     => 0.00,
                'allocated_tax'          => 0.00,
                'net_unit_refund'        => $unitPrice,
                'total_refund'           => $lineSubtotal,
                'sold_serial_number'     => $input['sold_serial_number'] ?? null,
                'returned_serial_number' => $input['returned_serial_number'] ?? null,
                'notes'                  => $input['notes'] ?? null,
            ];
        }

        return [
            'subtotal_amount'           => $totalSubtotal,
            'allocated_discount_amount' => 0.00,
            'tax_amount'                => 0.00,
            'restocking_fee'            => 0.00,
            'return_shipping_fee'       => 0.00,
            'total_refund_amount'       => $totalSubtotal,
            'items'                     => $calculatedItems,
        ];
    }

    /**
     * Approve return request.
     */
    public function approveReturn(int $id, ?string $adminNotes = null): OrderReturn
    {
        return DB::transaction(function () use ($id, $adminNotes) {
            $return = OrderReturn::findOrFail($id);

            if (!in_array($return->status, ['requested', 'under_review'])) {
                throw new \Exception("Return #{$return->return_number} cannot be approved from status '{$return->status}'.");
            }

            $return->update([
                'status'      => 'approved',
                'approved_by' => Auth::id() ?? 1,
                'approved_at' => now(),
                'admin_notes' => $adminNotes ?? $return->admin_notes,
            ]);

            return $return;
        });
    }

    /**
     * Reject return request.
     */
    public function rejectReturn(int $id, string $reason): OrderReturn
    {
        return DB::transaction(function () use ($id, $reason) {
            $return = OrderReturn::findOrFail($id);

            $return->update([
                'status'      => 'rejected',
                'admin_notes' => ($return->admin_notes ? $return->admin_notes . "\n" : '') . "Rejected: {$reason}",
            ]);

            return $return;
        });
    }

    /**
     * Record reverse logistics shipment.
     */
    public function recordShipment(int $id, array $data): ReturnShipment
    {
        return DB::transaction(function () use ($id, $data) {
            $return = OrderReturn::findOrFail($id);

            $shipment = ReturnShipment::create([
                'order_return_id'    => $return->id,
                'shipping_method_id' => $data['shipping_method_id'] ?? null,
                'carrier'            => $data['carrier'] ?? null,
                'tracking_number'    => $data['tracking_number'] ?? null,
                'pickup_type'        => $data['pickup_type'] ?? 'courier_dropoff',
                'shipping_fee'       => $data['shipping_fee'] ?? 0,
                'paid_by'            => $data['paid_by'] ?? ($return->fault === 'store' ? 'store' : 'customer'),
                'status'             => 'in_transit',
                'shipped_at'         => now(),
                'notes'              => $data['notes'] ?? null,
            ]);

            $return->update(['status' => 'in_transit']);

            return $shipment;
        });
    }

    /**
     * Mark return items physically received at warehouse holding.
     */
    public function receiveReturn(int $id, int $warehouseId, ?string $notes = null): OrderReturn
    {
        return DB::transaction(function () use ($id, $warehouseId, $notes) {
            $return = OrderReturn::findOrFail($id);

            $return->update([
                'warehouse_id' => $warehouseId,
                'status'       => 'inspecting',
                'admin_notes'  => ($return->admin_notes ? $return->admin_notes . "\n" : '') . "Received at warehouse on " . now()->toDateTimeString(),
            ]);

            // Update shipment if exists
            if ($return->latestShipment) {
                $return->latestShipment->update([
                    'status'       => 'delivered',
                    'delivered_at' => now(),
                ]);
            }

            return $return;
        });
    }

    /**
     * Complete Warehouse QC Inspection & Execute Inventory Movement Routing.
     */
    public function completeInspection(int $id, array $inspectionData): ReturnInspection
    {
        return DB::transaction(function () use ($id, $inspectionData) {
            $return = OrderReturn::with('items.product')->findOrFail($id);
            $inspectorId = Auth::id() ?? 1;
            $warehouseId = $inspectionData['warehouse_id'] ?? $return->warehouse_id;

            $inspectionNumber = 'QC-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));
            $overallVerdict = $inspectionData['verdict'] ?? 'pass';

            $inspection = ReturnInspection::create([
                'order_return_id'   => $return->id,
                'warehouse_id'      => $warehouseId,
                'inspector_id'      => $inspectorId,
                'inspection_number' => $inspectionNumber,
                'status'            => 'completed',
                'verdict'           => $overallVerdict,
                'summary_notes'     => $inspectionData['summary_notes'] ?? null,
                'images'            => $inspectionData['images'] ?? [],
                'inspected_at'      => now(),
            ]);

            $totalDeductions = 0;

            foreach ($inspectionData['items'] as $itemInspection) {
                $returnItem = OrderReturnItem::where('order_return_id', $return->id)
                    ->where('id', $itemInspection['order_return_item_id'])
                    ->firstOrFail();

                $serialMatched = (bool)($itemInspection['serial_matched'] ?? true);
                $conditionGrade = $itemInspection['condition_grade'] ?? 'resellable_new';
                $inventoryAction = $itemInspection['inventory_action'] ?? 'restock_available';
                $deduction = (float)($itemInspection['deduction_amount'] ?? 0);
                $totalDeductions += $deduction;

                // Anti-fraud Serial / IMEI check
                if ($returnItem->sold_serial_number && !empty($itemInspection['returned_serial_number'])) {
                    if ($returnItem->sold_serial_number !== $itemInspection['returned_serial_number']) {
                        $serialMatched = false;
                        $overallVerdict = 'fraud_suspected';
                    }
                }

                $inspectionItem = ReturnInspectionItem::create([
                    'return_inspection_id'  => $inspection->id,
                    'order_return_item_id'  => $returnItem->id,
                    'serial_matched'        => $serialMatched,
                    'accessories_checklist' => $itemInspection['accessories_checklist'] ?? [],
                    'condition_grade'       => $conditionGrade,
                    'deduction_amount'      => $deduction,
                    'inventory_action'      => $inventoryAction,
                    'inspector_notes'       => $itemInspection['inspector_notes'] ?? null,
                    'photos'                => $itemInspection['photos'] ?? [],
                ]);

                $returnItem->update([
                    'quantity_received'      => $itemInspection['quantity_received'] ?? $returnItem->quantity_requested,
                    'returned_serial_number' => $itemInspection['returned_serial_number'] ?? $returnItem->returned_serial_number,
                    'condition_grade'        => $conditionGrade,
                    'inspection_status'      => $serialMatched ? ($deduction > 0 ? 'partial' : 'passed') : 'failed',
                ]);

                // ── Inventory Routing State Machine ────────────────────────
                $product = $returnItem->product;
                $qty = (float)($itemInspection['quantity_received'] ?? $returnItem->quantity_requested);

                if ($product && $product->track_inventory && $qty > 0) {
                    $inventory = Inventory::firstOrCreate(
                        [
                            'company_id'         => $return->company_id,
                            'warehouse_id'       => $warehouseId,
                            'product_id'         => $returnItem->product_id,
                            'product_variant_id' => $returnItem->product_variant_id,
                        ],
                        ['quantity' => 0, 'reserved_quantity' => 0]
                    );

                    $qtyBefore = (float)$inventory->quantity;

                    $isSqlite = DB::getDriverName() === 'sqlite';

                    if ($inventoryAction === 'restock_available' && $serialMatched) {
                        // Restock as active available inventory
                        $inventory->increment('quantity', $qty);
                        $qtyAfter = $qtyBefore + $qty;

                        InventoryMovement::create([
                            'company_id'         => $return->company_id,
                            'warehouse_id'       => $warehouseId,
                            'product_id'         => $returnItem->product_id,
                            'product_variant_id' => $returnItem->product_variant_id,
                            'user_id'            => $inspectorId,
                            'reference_type'     => OrderReturn::class,
                            'reference_id'       => $return->id,
                            'type'               => $isSqlite ? 'in' : 'sale_return_restock',
                            'quantity'           => $qty,
                            'quantity_before'    => $qtyBefore,
                            'quantity_after'     => $qtyAfter,
                            'unit_cost'          => $returnItem->unit_price,
                            'notes'              => "QC Passed: Restocked from Return #{$return->return_number}",
                        ]);
                    } elseif ($inventoryAction === 'move_to_damaged_quarantine') {
                        // Log movement to quarantine bin
                        InventoryMovement::create([
                            'company_id'         => $return->company_id,
                            'warehouse_id'       => $warehouseId,
                            'product_id'         => $returnItem->product_id,
                            'product_variant_id' => $returnItem->product_variant_id,
                            'user_id'            => $inspectorId,
                            'reference_type'     => OrderReturn::class,
                            'reference_id'       => $return->id,
                            'type'               => $isSqlite ? 'in' : 'damaged_quarantine',
                            'quantity'           => $qty,
                            'quantity_before'    => $qtyBefore,
                            'quantity_after'     => $qtyBefore,
                            'unit_cost'          => $returnItem->unit_price,
                            'notes'              => "QC Damaged: Held in Quarantine from Return #{$return->return_number}",
                        ]);
                    } elseif ($inventoryAction === 'scrap_write_off') {
                        // Log scrap loss
                        InventoryMovement::create([
                            'company_id'         => $return->company_id,
                            'warehouse_id'       => $warehouseId,
                            'product_id'         => $returnItem->product_id,
                            'product_variant_id' => $returnItem->product_variant_id,
                            'user_id'            => $inspectorId,
                            'reference_type'     => OrderReturn::class,
                            'reference_id'       => $return->id,
                            'type'               => $isSqlite ? 'out' : 'scrap_loss',
                            'quantity'           => $qty,
                            'quantity_before'    => $qtyBefore,
                            'quantity_after'     => $qtyBefore,
                            'unit_cost'          => $returnItem->unit_price,
                            'notes'              => "QC Total Loss: Scrapped from Return #{$return->return_number}",
                        ]);
                    }
                }
            }

            // Adjust final refund amount if there are accessory deductions
            $adjustedRefund = max(0, (float)$return->total_refund_amount - $totalDeductions);

            $return->update([
                'total_refund_amount' => $adjustedRefund,
                'status'              => $overallVerdict === 'fraud_suspected' ? 'rejected' : 'inspected',
                'admin_notes'         => ($return->admin_notes ? $return->admin_notes . "\n" : '') .
                    "QC Inspection {$inspectionNumber} Verdict: {$overallVerdict}. Deductions: \${$totalDeductions}",
            ]);

            $inspection->update(['verdict' => $overallVerdict]);

            return $inspection;
        });
    }

    /**
     * Settle Refund (via Original Payment Gateway, Cash, Bakong KHQR, or Store Credit Wallet).
     */
    public function settleRefund(int $id, array $data): OrderReturn
    {
        return DB::transaction(function () use ($id, $data) {
            $return = OrderReturn::with('customer')->findOrFail($id);

            $refundMethod = $data['refund_method'] ?? $return->refund_method;
            $refundAmount = (float)($data['refund_amount'] ?? $return->total_refund_amount);

            if ($refundMethod === 'store_credit' && $return->customer) {
                // Issue store credit to customer wallet
                $this->walletService->creditStoreReturn(
                    $return->customer,
                    $refundAmount,
                    $return->id,
                    "Store Credit Refund for Return #{$return->return_number}"
                );
            }

            $return->update([
                'refund_status'       => 'refunded',
                'refund_method'       => $refundMethod,
                'total_refund_amount' => $refundAmount,
                'status'              => 'completed',
                'completed_at'        => now(),
                'admin_notes'         => ($return->admin_notes ? $return->admin_notes . "\n" : '') .
                    "Refund settled via {$refundMethod} for amount \${$refundAmount} on " . now()->toDateTimeString(),
            ]);

            return $return;
        });
    }

    /**
     * Create Exchange Settlement and generate replacement order.
     */
    public function processExchange(int $id, array $exchangeData): ExchangeOrder
    {
        return DB::transaction(function () use ($id, $exchangeData) {
            $return = OrderReturn::with(['order', 'customer'])->findOrFail($id);
            $oldCredit = (float)$return->total_refund_amount;

            $diff = $this->financialCalculator->calculateExchangeDifferential(
                $oldCredit,
                (float)$exchangeData['new_product_price'],
                (float)($exchangeData['new_product_tax'] ?? 0),
                (float)($exchangeData['exchange_fee'] ?? 0),
                (float)($exchangeData['replacement_shipping'] ?? 0),
                $return->fault
            );

            $exchangeOrder = ExchangeOrder::create([
                'order_return_id'      => $return->id,
                'old_items_credit'     => $diff['old_items_credit'],
                'new_items_cost'       => $diff['new_items_cost'],
                'price_difference'     => $diff['price_difference'],
                'exchange_fee'         => $diff['exchange_fee'],
                'shipping_difference'  => $diff['shipping_difference'],
                'customer_balance_due' => $diff['customer_balance_due'],
                'store_refund_due'     => $diff['store_refund_due'],
                'payment_status'       => $diff['customer_balance_due'] == 0 ? 'paid' : ($exchangeData['payment_status'] ?? 'unpaid'),
                'notes'                => $exchangeData['notes'] ?? null,
            ]);

            $return->update([
                'type'          => 'exchange',
                'refund_status' => 'offset_exchange',
                'status'        => 'completed',
                'completed_at'  => now(),
            ]);

            return $exchangeOrder;
        });
    }

    /**
     * Auto-expire returns that were not shipped in time.
     */
    public function autoExpireReturns(): int
    {
        return OrderReturn::whereIn('status', ['requested', 'approved'])
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);
    }
}
