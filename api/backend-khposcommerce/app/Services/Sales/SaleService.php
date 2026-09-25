<?php

namespace App\Services\Sales;

use App\Models\Customer\Customer;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use App\Models\Marketing\Coupon;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SaleService
{
    /**
     * Generate a unique invoice number.
     */
    public function generateInvoiceNumber(string $prefix = 'INV-'): string
    {
        return \App\Services\Support\ReferenceNumberService::invoice($prefix);
    }

    /**
     * Process and record a complete sale with strict stock availability checking and inventory deduction.
     *
     * @param array $data
     * @param User|null $user
     * @return Sale
     * @throws ValidationException
     */
    public function processSale(array $data, ?User $user = null): Sale
    {
        return DB::transaction(function () use ($data, $user) {
            $companyId = $data['company_id'] ?? $user?->company_id ?? 1;

            // Resolve company/branch/warehouse IDs
            $branchId    = $data['branch_id']    ?? $user?->branch_id ?? DB::table('branches')->where('company_id', $companyId)->value('id') ?? 1;
            $warehouseId = $data['warehouse_id'] ?? $user?->warehouse_id ?? DB::table('warehouses')->where('company_id', $companyId)->value('id') ?? 1;
            $storeId     = $data['store_id']     ?? DB::table('stores')->where('company_id', $companyId)->value('id');

            // Generate invoice number if not provided
            $invoiceNumber = $data['invoice_number'] ?? $this->generateInvoiceNumber();

            // Eager-load all products to prevent N+1 queries
            $productIds = collect($data['items'])->pluck('product_id')->unique()->toArray();
            $productsMap = Product::with('tax')
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            // 1. Strict Stock Availability Check
            foreach ($data['items'] as $item) {
                $product = $productsMap[$item['product_id']] ?? null;
                if (!$product) {
                    continue;
                }

                $variantId = $item['product_variant_id'] ?? null;
                $qty = (float) ($item['quantity'] ?? $item['qty'] ?? 1);

                if ($product->track_inventory) {
                    $invQuery = Inventory::where('product_id', $product->id)
                        ->when($variantId, fn($q) => $q->where('product_variant_id', $variantId));

                    if ($warehouseId) {
                        $invQuery->where('warehouse_id', $warehouseId);
                    }

                    $availableStock = (float) ($invQuery->sum('quantity') ?? 0);

                    if ($availableStock <= 0 || $availableStock < $qty) {
                        throw ValidationException::withMessages([
                            'stock' => [
                                "ទំនិញ '{$product->name}' អស់ពីស្តុកហើយ (ស្តុកនៅសល់: {$availableStock}, ចំនួនចង់ទិញ: {$qty})។ មិនអាចលក់បានឡើយ!"
                            ]
                        ]);
                    }
                }
            }

            // Sync PostgreSQL sequences if needed
            try {
                $maxSalesId = DB::table('sales')->max('id') ?: 1;
                DB::statement("SELECT setval(pg_get_serial_sequence('sales', 'id'), {$maxSalesId})");
            } catch (\Throwable $e) {
                // Ignore if not PostgreSQL
            }

            $subtotal       = (float) $data['subtotal'];
            $discountAmount = (float) ($data['discount_amount'] ?? 0);
            $taxAmount      = (float) ($data['tax_amount'] ?? 0);
            $grandTotal     = (float) $data['grand_total'];
            $paidAmount     = (float) ($data['paid_amount'] ?? $grandTotal);
            $changeAmount   = (float) ($data['change_amount'] ?? max(0, $paidAmount - $grandTotal));

            // Format notes if payment details are present
            $notes = $data['notes'] ?? null;
            if (!empty($data['payment_details']) && is_array($data['payment_details'])) {
                $bank = $data['payment_details']['bank_name'] ?? 'Bank';
                if (!empty($data['payment_details']['txn_reference'])) {
                    $ref = $data['payment_details']['txn_reference'];
                    $acc = $data['payment_details']['account_number'] ?? '';
                    $notes = ($notes ? "{$notes} | " : '') . "Bank Transfer: {$bank} (Acc: {$acc}), Txn Ref: #{$ref}";
                } elseif (!empty($data['payment_details']['approval_code'])) {
                    $card = $data['payment_details']['card_type'] ?? 'Card';
                    $code = $data['payment_details']['approval_code'] ?? '';
                    $notes = ($notes ? "{$notes} | " : '') . "Card Payment: {$card} ({$bank}), Approval Code: {$code}";
                }
            }

            // Create Sale Header
            $sale = Sale::create([
                'company_id'      => $companyId,
                'branch_id'       => $branchId,
                'store_id'        => $storeId,
                'warehouse_id'    => $warehouseId,
                'customer_id'     => $data['customer_id'] ?? null,
                'user_id'         => $user?->id,
                'invoice_number'  => $invoiceNumber,
                'date'            => now(),
                'status'          => $data['status'] ?? 'completed',
                'subtotal'        => $subtotal,
                'tax_amount'      => $taxAmount,
                'discount_amount' => $discountAmount,
                'grand_total'     => $grandTotal,
                'paid_amount'     => $paidAmount,
                'change_amount'   => $changeAmount,
                'payment_method'  => $data['payment_method'] ?? 'cash',
                'payment_details' => $data['payment_details'] ?? null,
                'notes'           => $notes,
                'currency_code'   => $data['currency_code'] ?? 'USD',
            ]);

            // 2. Create Sale Items, Deduct Inventory Stock & Log Movements
            foreach ($data['items'] as $item) {
                $product   = $productsMap[$item['product_id']];
                $variantId = !empty($item['product_variant_id']) ? (int) $item['product_variant_id'] : null;
                $variant   = $variantId ? ProductVariant::find($variantId) : null;
                $qty       = (float) ($item['quantity'] ?? $item['qty'] ?? 1);
                $unitPrice = (float) ($item['unit_price'] ?? $item['price'] ?? 0);
                $costPrice = (float) ($item['cost_price'] ?? $variant?->cost_price ?? $product->cost_price ?? 0);
                $discAmt   = (float) ($item['discount_amount'] ?? 0);

                // Compute tax
                $taxRate = 0;
                if ($product->tax) {
                    $taxRate = $product->tax->type === 'percentage' ? (float) $product->tax->rate : 0;
                }
                $taxPercent   = (float) ($item['tax_percent'] ?? $taxRate);
                $lineSubtotal = ($unitPrice * $qty) - $discAmt;
                $lineTax      = (float) ($item['tax_amount'] ?? round($lineSubtotal * ($taxPercent / 100), 2));
                $lineTotal    = (float) ($item['total'] ?? ($lineSubtotal + $lineTax));

                $sale->items()->create([
                    'product_id'         => $product->id,
                    'product_variant_id' => $variantId,
                    'product_name'       => $product->name,
                    'sku'                => $variant?->sku ?? $product->sku ?? ('SKU-' . $product->id),
                    'quantity'           => $qty,
                    'unit_price'         => $unitPrice,
                    'cost_price'         => $costPrice,
                    'discount_amount'    => $discAmt,
                    'tax_percent'        => $taxPercent,
                    'tax_amount'         => $lineTax,
                    'subtotal'           => round($lineSubtotal, 2),
                    'total'              => round($lineTotal, 2),
                ]);

                // Pessimistic lock and decrement inventory
                $inventory = Inventory::where('warehouse_id', $warehouseId)
                    ->where('product_id', $product->id)
                    ->when($variantId, fn($q) => $q->where('product_variant_id', $variantId))
                    ->lockForUpdate()
                    ->first();

                $qtyBefore = $inventory ? (float) $inventory->quantity : (float) ($product->stock ?? 0);
                $qtyAfter  = max(0, $qtyBefore - $qty);

                if ($inventory) {
                    $inventory->decrement('quantity', $qty);
                } else {
                    Inventory::create([
                        'company_id'         => $companyId,
                        'warehouse_id'       => $warehouseId,
                        'product_id'         => $product->id,
                        'product_variant_id' => $variantId,
                        'quantity'           => 0,
                    ]);
                }

                // Log Inventory Movement
                InventoryMovement::create([
                    'company_id'         => $companyId,
                    'warehouse_id'       => $warehouseId,
                    'product_id'         => $product->id,
                    'product_variant_id' => $variantId,
                    'user_id'            => $user?->id,
                    'type'               => 'out',
                    'quantity'           => $qty,
                    'reference_type'     => Sale::class,
                    'reference_id'       => $sale->id,
                    'notes'              => "Sale Invoice #{$sale->invoice_number}",
                    'quantity_before'    => $qtyBefore,
                    'quantity_after'     => $qtyAfter,
                    'unit_cost'          => $costPrice ?: $unitPrice,
                ]);

                // Update product sold count
                $product->increment('sold_count', (int) ceil($qty));
            }

            // 3. Increment Coupon usage count if coupon applied
            if (!empty($data['coupon_code'])) {
                $couponCode = strtoupper(trim((string) $data['coupon_code']));
                $coupon = Coupon::where('code', $couponCode)->first();
                if ($coupon) {
                    $coupon->increment('used_count');
                }
            }

            // 4. Update Customer total_spent, order_count, and loyalty_points
            if (!empty($sale->customer_id)) {
                $customer = Customer::find($sale->customer_id);
                if ($customer) {
                    $completedSales = Sale::where('customer_id', $customer->id)->where('status', 'completed');
                    $customerTotalSpent = (float) $completedSales->sum('grand_total');
                    $customerOrderCount = $completedSales->count();
                    $customerLoyaltyPoints = round($customerTotalSpent, 2);

                    $customer->update([
                        'total_spent'    => $customerTotalSpent,
                        'order_count'    => $customerOrderCount,
                        'loyalty_points' => $customerLoyaltyPoints,
                    ]);
                }
            }

            return $sale->load(['items.product', 'items.variant', 'customer', 'cashier']);
        });
    }
}
