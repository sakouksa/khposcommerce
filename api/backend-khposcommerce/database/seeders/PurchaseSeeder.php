<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Warehouse;
use App\Models\Supplier\Supplier;
use App\Models\Product\Product;

class PurchaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clean existing tables in cascade order
        DB::table('purchase_return_items')->delete();
        DB::table('purchase_returns')->delete();
        DB::table('purchase_items')->delete();
        DB::table('purchases')->delete();

        $companyId = Company::value('id') ?? 1;
        $branchId = Branch::value('id') ?? 1;
        $warehouseId = Warehouse::value('id') ?? 1;

        $supplierIds = Supplier::pluck('id')->toArray();
        if (empty($supplierIds)) {
            $supplierIds = [1];
        }

        $products = Product::with('variants')->get();
        if ($products->isEmpty()) {
            return;
        }

        $purchases = [];
        $purchaseItems = [];
        $purchaseReturns = [];
        $purchaseReturnItems = [];

        $pItemCount = 1;
        $prItemCount = 1;

        // Generate 100 purchases
        for ($pId = 1; $pId <= 100; $pId++) {
            $suppId = $supplierIds[array_rand($supplierIds)];
            $subtotal = 0;
            $itemsInPurchase = rand(3, 6); // 3 to 6 items per purchase

            // Pick random products for this purchase
            $selectedProducts = $products->random(min($itemsInPurchase, $products->count()));

            $tempItems = [];
            $itemIdx = 1;
            foreach ($selectedProducts as $product) {
                $qty = rand(5, 40);
                
                // Check if product has variants
                $variant = $product->variants->isNotEmpty() ? $product->variants->random() : null;
                $variantId = $variant ? $variant->id : null;
                
                // Unit cost from variant or product, fallback to reasonable USD cost strictly under $1.00
                $baseCost = (float)($variant?->cost_price ?? $product->cost_price ?? 0);
                if ($baseCost <= 0) {
                    $baseCost = round(rand(15, 60) / 100, 2);
                }
                $unitCost = min(0.85, max(0.01, $baseCost));

                $discPercent = rand(0, 8);
                $discAmt = round(($qty * $unitCost) * $discPercent / 100, 2);
                $taxPercent = 10.00;
                $taxAmt = round((($qty * $unitCost) - $discAmt) * $taxPercent / 100, 2);
                $itemSubtotal = round($qty * $unitCost, 2);
                $itemTotal = round($itemSubtotal - $discAmt + $taxAmt, 2);

                $subtotal += $itemTotal;

                $tempItems[] = [
                    'id' => $pItemCount++,
                    'purchase_id' => $pId,
                    'product_id' => $product->id,
                    'product_variant_id' => $variantId,
                    'quantity' => $qty,
                    'quantity_received' => $qty,
                    'unit_cost' => $unitCost,
                    'unit_cost_base' => $unitCost,
                    'discount_percent' => $discPercent,
                    'discount_amount' => $discAmt,
                    'tax_percent' => $taxPercent,
                    'tax_amount' => $taxAmt,
                    'subtotal' => $itemSubtotal,
                    'subtotal_base' => $itemSubtotal,
                    'total' => $itemTotal,
                    'total_base' => $itemTotal,
                    'currency_code' => 'USD',
                    'exchange_rate' => 1.000000,
                    'notes' => 'Supply item #' . $itemIdx . ' for ' . $product->name,
                    'created_at' => now()->subDays(100 - $pId),
                    'updated_at' => now()->subDays(100 - $pId),
                ];
                $itemIdx++;
            }

            $discountAmount = round($subtotal * rand(0, 5) / 100, 2);
            $taxAmount = round(($subtotal - $discountAmount) * 10 / 100, 2);
            $shippingCost = round(rand(10, 30) / 100, 2);
            $grandTotal = round($subtotal - $discountAmount + $taxAmount + $shippingCost, 2);
            
            // Valid status enum: 'draft', 'ordered', 'partial', 'received', 'cancelled'
            $statusRandom = rand(1, 100);
            $status = $statusRandom <= 65 ? 'received' : ($statusRandom <= 80 ? 'ordered' : ($statusRandom <= 95 ? 'partial' : 'draft'));
            
            // Valid payment_status enum: 'unpaid', 'partial', 'paid'
            $paymentRandom = rand(1, 100);
            $paymentStatus = $paymentRandom <= 60 ? 'paid' : ($paymentRandom <= 85 ? 'partial' : 'unpaid');
            $paidAmount = $paymentStatus === 'paid' ? $grandTotal : ($paymentStatus === 'partial' ? round($grandTotal * 0.5, 2) : 0.00);
            $dueAmount = round($grandTotal - $paidAmount, 2);

            // Fix quantity_received on items based on status
            foreach ($tempItems as &$tItem) {
                if ($status === 'received') {
                    $tItem['quantity_received'] = $tItem['quantity'];
                } elseif ($status === 'partial') {
                    $tItem['quantity_received'] = max(1, (int)floor($tItem['quantity'] * 0.5));
                } else {
                    $tItem['quantity_received'] = 0;
                }
            }
            unset($tItem);

            $purchases[] = [
                'id' => $pId,
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'supplier_id' => $suppId,
                'user_id' => 1,
                'reference_number' => 'PO-' . date('Ymd') . '-' . str_pad($pId, 4, '0', STR_PAD_LEFT),
                'date' => now()->subDays(100 - $pId)->format('Y-m-d'),
                'due_date' => now()->subDays(100 - $pId)->addDays(30)->format('Y-m-d'),
                'status' => $status,
                'payment_status' => $paymentStatus,
                'subtotal' => $subtotal,
                'subtotal_base' => $subtotal,
                'tax_amount' => $taxAmount,
                'tax_amount_base' => $taxAmount,
                'discount_amount' => $discountAmount,
                'discount_amount_base' => $discountAmount,
                'shipping_cost' => $shippingCost,
                'shipping_cost_base' => $shippingCost,
                'grand_total' => $grandTotal,
                'grand_total_base' => $grandTotal,
                'paid_amount' => $paidAmount,
                'paid_amount_base' => $paidAmount,
                'due_amount' => $dueAmount,
                'due_amount_base' => $dueAmount,
                'currency_code' => 'USD',
                'exchange_rate' => 1.000000,
                'notes' => 'Inventory replenishment purchase order #' . $pId,
                'created_at' => now()->subDays(100 - $pId),
                'updated_at' => now()->subDays(100 - $pId),
            ];

            foreach ($tempItems as $item) {
                $purchaseItems[] = $item;
            }

            // Create purchase returns (15 purchase returns total)
            if ($pId <= 15 && count($tempItems) > 0) {
                $retItemId = rand(0, count($tempItems) - 1);
                $retItem = $tempItems[$retItemId];
                $retQty = rand(1, min(3, $retItem['quantity']));
                $retTotal = round($retQty * $retItem['unit_cost'], 2);

                $purchaseReturns[] = [
                    'id' => $pId,
                    'company_id' => $companyId,
                    'purchase_id' => $pId,
                    'supplier_id' => $suppId,
                    'user_id' => 1,
                    'reference_number' => 'PRT-' . date('Ymd') . '-' . str_pad($pId, 4, '0', STR_PAD_LEFT),
                    'date' => now()->subDays(100 - $pId)->addDays(5)->format('Y-m-d'),
                    'total_amount' => $retTotal,
                    'reason' => 'Defective or damaged items returned from PO #' . $pId,
                    'status' => 'approved',
                    'created_at' => now()->subDays(100 - $pId)->addDays(5),
                    'updated_at' => now()->subDays(100 - $pId)->addDays(5),
                ];

                $purchaseReturnItems[] = [
                    'id' => $prItemCount++,
                    'purchase_return_id' => $pId,
                    'purchase_item_id' => $retItem['id'],
                    'product_id' => $retItem['product_id'],
                    'product_variant_id' => $retItem['product_variant_id'],
                    'quantity' => $retQty,
                    'unit_cost' => $retItem['unit_cost'],
                    'total' => $retTotal,
                    'notes' => 'Returned due to factory packaging defect',
                    'created_at' => now()->subDays(100 - $pId)->addDays(5),
                    'updated_at' => now()->subDays(100 - $pId)->addDays(5),
                ];
            }
        }

        // Batch insert purchases
        DB::table('purchases')->insert($purchases);
        
        // Batch insert purchase items in chunks of 100
        foreach (array_chunk($purchaseItems, 100) as $chunk) {
            DB::table('purchase_items')->insert($chunk);
        }

        // Batch insert returns
        DB::table('purchase_returns')->insert($purchaseReturns);
        DB::table('purchase_return_items')->insert($purchaseReturnItems);

        // Sync PostgreSQL sequences so auto-increment works on new inserts
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('purchases', 'id'), coalesce(max(id), 1) + 1, false) FROM purchases;");
            DB::statement("SELECT setval(pg_get_serial_sequence('purchase_items', 'id'), coalesce(max(id), 1) + 1, false) FROM purchase_items;");
            DB::statement("SELECT setval(pg_get_serial_sequence('purchase_returns', 'id'), coalesce(max(id), 1) + 1, false) FROM purchase_returns;");
            DB::statement("SELECT setval(pg_get_serial_sequence('purchase_return_items', 'id'), coalesce(max(id), 1) + 1, false) FROM purchase_return_items;");
        }
    }
}
