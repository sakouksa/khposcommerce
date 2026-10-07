<?php

namespace App\Services\Sales\Actions;

use App\Services\Inventory\InventoryService;
use App\Services\Sales\PricingService;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use App\Models\Payment\Payment;
use App\Models\Product\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateSaleAction
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly PricingService $pricingService
    ) {
    }

    /**
     * Create a Sale transaction, calculate line items, update stock, and record payment.
     */
    public function execute(array $data, ?int $userId = null): Sale
    {
        return DB::transaction(function () use ($data, $userId) {
            $user = auth()->user();
            $userId = $userId ?: $user?->id;
            $companyId = $data['company_id'] ?? $user?->company_id ?? 1;
            $warehouseId = $data['warehouse_id'] ?? 1;
            $branchId = $data['branch_id'] ?? $user?->branch_id ?? 1;
            $storeId = $data['store_id'] ?? 1;

            $itemsData = $data['items'] ?? [];
            $subtotal = 0.0;
            $taxAmount = 0.0;
            $discountAmount = 0.0;
            $processedItems = [];

            foreach ($itemsData as $item) {
                $qty = (float) ($item['quantity'] ?? 1);
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $itemDiscount = (float) ($item['discount_amount'] ?? 0);
                $itemTax = (float) ($item['tax_amount'] ?? 0);

                $lineSubtotal = round($unitPrice * $qty, 2);
                $lineTotal = round($lineSubtotal - $itemDiscount + $itemTax, 2);

                $subtotal += $lineSubtotal;
                $discountAmount += $itemDiscount;
                $taxAmount += $itemTax;

                $product = Product::find($item['product_id']);
                $processedItems[] = [
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'product_name'       => $item['product_name'] ?? $product?->name ?? 'Item',
                    'sku'                => $item['sku'] ?? $product?->sku ?? 'SKU',
                    'quantity'           => $qty,
                    'unit_price'         => $unitPrice,
                    'subtotal'           => $lineSubtotal,
                    'discount_amount'    => $itemDiscount,
                    'tax_amount'         => $itemTax,
                    'total'              => $lineTotal,
                    'unit_cost'          => (float) ($item['unit_cost'] ?? 0),
                ];
            }

            // Apply global discount if provided
            if (isset($data['discount_amount']) && (float) $data['discount_amount'] > 0) {
                $discountAmount = (float) $data['discount_amount'];
            }

            $grandTotal = max(0.0, round($subtotal - $discountAmount + $taxAmount, 2));
            $paidAmount = isset($data['paid_amount']) ? (float) $data['paid_amount'] : $grandTotal;
            $changeAmount = max(0.0, round($paidAmount - $grandTotal, 2));

            $invoiceNumber = $data['invoice_number'] ?? ('INV-' . strtoupper(Str::random(4)) . '-' . date('YmdHis'));

            $sale = Sale::create([
                'company_id'        => $companyId,
                'branch_id'         => $branchId,
                'store_id'          => $data['store_id'] ?? null,
                'warehouse_id'      => $warehouseId,
                'customer_id'       => $data['customer_id'] ?? null,
                'user_id'           => $userId,
                'invoice_number'    => $invoiceNumber,
                'date'              => $data['date'] ?? now(),
                'status'            => $data['status'] ?? 'completed',
                'subtotal'          => $subtotal,
                'tax_amount'        => $taxAmount,
                'discount_amount'   => $discountAmount,
                'grand_total'       => $grandTotal,
                'paid_amount'       => $paidAmount,
                'change_amount'     => $changeAmount,
                'currency_code'     => $data['currency_code'] ?? 'USD',
                'payment_method_id' => $data['payment_method_id'] ?? null,
                'payment_method'    => $data['payment_method'] ?? 'cash',
                'payment_details'   => $data['payment_details'] ?? null,
                'notes'             => $data['notes'] ?? null,
            ]);

            // Create Sale Items and deduct inventory stock
            foreach ($processedItems as $pItem) {
                $sale->items()->create($pItem);

                if ($sale->status === 'completed') {
                    $this->inventoryService->adjustStock(
                        companyId: $companyId,
                        warehouseId: $warehouseId,
                        productId: $pItem['product_id'],
                        variantId: $pItem['product_variant_id'],
                        qtyChange: -($pItem['quantity']),
                        movementType: 'out',
                        referenceType: Sale::class,
                        referenceId: $sale->id,
                        unitCost: $pItem['unit_cost'] ?: null,
                        notes: "POS Sale #{$sale->invoice_number}",
                        userId: $userId
                    );
                }
            }

            return $sale->load(['items.product', 'customer', 'cashier']);
        });
    }
}
