<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Warehouse;
use App\Models\Product\Product;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('stock_opname_items')->delete();
        DB::table('stock_opnames')->delete();
        DB::table('stock_transfer_items')->delete();
        DB::table('stock_transfers')->delete();
        DB::table('stock_adjustment_items')->delete();
        DB::table('stock_adjustments')->delete();
        DB::table('inventory_movements')->delete();
        DB::table('inventories')->delete();

        $companyId = Company::value('id') ?? 1;
        $products = DB::table('products')->select('id', 'name', 'cost_price', 'selling_price')->get()->keyBy('id');

        // 1. Seed initial inventories for all 100 products
        $inventories = [];
        $movements = [];

        for ($pId = 1; $pId <= 100; $pId++) {
            $qty1 = rand(50, 200);
            $qty2 = rand(30, 100);
            $p = $products->get($pId);
            $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.45));

            // Warehouse 1
            $inventories[] = [
                'company_id' => $companyId,
                'warehouse_id' => 1,
                'product_id' => $pId,
                'product_variant_id' => null,
                'quantity' => $qty1,
                'reserved_quantity' => 0,
                'reorder_point' => 5,
                'reorder_qty' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Initial movement (Opening Balance)
            $movements[] = [
                'company_id' => $companyId,
                'warehouse_id' => 1,
                'product_id' => $pId,
                'product_variant_id' => null,
                'user_id' => 1,
                'reference_type' => 'opening_balance',
                'reference_id' => null,
                'type' => 'in',
                'quantity' => $qty1,
                'quantity_before' => 0,
                'quantity_after' => $qty1,
                'unit_cost' => $cost,
                'notes' => 'Initial stock opening balance',
                'created_at' => now()->subDays(60),
                'updated_at' => now()->subDays(60),
            ];

            // Warehouse 2
            $inventories[] = [
                'company_id' => $companyId,
                'warehouse_id' => 2,
                'product_id' => $pId,
                'product_variant_id' => null,
                'quantity' => $qty2,
                'reserved_quantity' => 0,
                'reorder_point' => 5,
                'reorder_qty' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $movements[] = [
                'company_id' => $companyId,
                'warehouse_id' => 2,
                'product_id' => $pId,
                'product_variant_id' => null,
                'user_id' => 1,
                'reference_type' => 'opening_balance',
                'reference_id' => null,
                'type' => 'in',
                'quantity' => $qty2,
                'quantity_before' => 0,
                'quantity_after' => $qty2,
                'unit_cost' => $cost,
                'notes' => 'Initial stock opening balance',
                'created_at' => now()->subDays(60),
                'updated_at' => now()->subDays(60),
            ];
        }

        // Also seed inventories for warehouses 3 to 10
        for ($wId = 3; $wId <= 10; $wId++) {
            for ($pId = 1; $pId <= 10; $pId++) {
                $qty = rand(40, 150);
                $comp = DB::table('warehouses')->where('id', $wId)->value('company_id') ?? $companyId;
                $inventories[] = [
                    'company_id' => $comp,
                    'warehouse_id' => $wId,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'quantity' => $qty,
                    'reserved_quantity' => 0,
                    'reorder_point' => 5,
                    'reorder_qty' => 20,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Seed inventories for all product variants
        $variants = DB::table('product_variants')->get();
        foreach ($variants as $v) {
            $inventories[] = [
                'company_id' => $companyId,
                'warehouse_id' => 1,
                'product_id' => $v->product_id,
                'product_variant_id' => $v->id,
                'quantity' => rand(30, 80),
                'reserved_quantity' => 0,
                'reorder_point' => 5,
                'reorder_qty' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $inventories[] = [
                'company_id' => $companyId,
                'warehouse_id' => 2,
                'product_id' => $v->product_id,
                'product_variant_id' => $v->id,
                'quantity' => rand(20, 50),
                'reserved_quantity' => 0,
                'reorder_point' => 5,
                'reorder_qty' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        foreach (array_chunk($inventories, 100) as $chunk) {
            DB::table('inventories')->insert($chunk);
        }

        // 2. Stock Adjustments (15 records)
        $adjustments = [];
        $adjustmentItems = [];
        for ($adjId = 1; $adjId <= 15; $adjId++) {
            $adjustments[] = [
                'id' => $adjId,
                'company_id' => $companyId,
                'warehouse_id' => 1,
                'user_id' => 1,
                'reference_number' => 'ADJ-' . date('Ymd') . '-' . str_pad($adjId, 4, '0', STR_PAD_LEFT),
                'date' => now()->subDays(15 - $adjId)->format('Y-m-d'),
                'type' => $adjId % 2 === 0 ? 'addition' : 'subtraction',
                'reason' => 'Inventory count variance correction ' . $adjId,
                'status' => 'approved',
                'approved_by' => 1,
                'approved_at' => now(),
                'created_at' => now()->subDays(15 - $adjId),
                'updated_at' => now()->subDays(15 - $adjId),
            ];

            for ($itemIdx = 1; $itemIdx <= 2; $itemIdx++) {
                $pId = (($adjId * 4 + $itemIdx) % 100) + 1;
                $p = $products->get($pId);
                $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.35));
                $adjustedQty = rand(2, 6);

                $adjustmentItems[] = [
                    'stock_adjustment_id' => $adjId,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'quantity_before' => 50,
                    'quantity_adjusted' => $adjustedQty,
                    'quantity_after' => $adjId % 2 === 0 ? (50 + $adjustedQty) : (50 - $adjustedQty),
                    'notes' => 'Audited by warehouse supervisor',
                    'created_at' => now()->subDays(15 - $adjId),
                    'updated_at' => now()->subDays(15 - $adjId),
                ];

                $movements[] = [
                    'company_id' => $companyId,
                    'warehouse_id' => 1,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'user_id' => 1,
                    'reference_type' => 'stock_adjustment',
                    'reference_id' => $adjId,
                    'type' => $adjId % 2 === 0 ? 'in' : 'out',
                    'quantity' => $adjustedQty,
                    'quantity_before' => 50,
                    'quantity_after' => $adjId % 2 === 0 ? (50 + $adjustedQty) : (50 - $adjustedQty),
                    'unit_cost' => $cost,
                    'notes' => 'Adjusted via ADJ-' . str_pad($adjId, 4, '0', STR_PAD_LEFT),
                    'created_at' => now()->subDays(15 - $adjId),
                    'updated_at' => now()->subDays(15 - $adjId),
                ];
            }
        }
        DB::table('stock_adjustments')->insert($adjustments);
        DB::table('stock_adjustment_items')->insert($adjustmentItems);

        // 3. Stock Transfers (15 transfers from warehouse 1 to 2)
        $transfers = [];
        $transferItems = [];
        for ($stId = 1; $stId <= 15; $stId++) {
            $transfers[] = [
                'id' => $stId,
                'company_id' => $companyId,
                'from_warehouse_id' => 1,
                'to_warehouse_id' => 2,
                'user_id' => 1,
                'reference_number' => 'TRF-' . date('Ymd') . '-' . str_pad($stId, 4, '0', STR_PAD_LEFT),
                'date' => now()->subDays(20 - $stId)->format('Y-m-d'),
                'notes' => 'Branch replenishment transfer ' . $stId,
                'status' => 'received',
                'shipped_at' => now()->subDays(20 - $stId)->addHours(2),
                'received_at' => now()->subDays(20 - $stId)->addHours(6),
                'created_at' => now()->subDays(20 - $stId),
                'updated_at' => now()->subDays(20 - $stId),
            ];

            for ($itemIdx = 1; $itemIdx <= 2; $itemIdx++) {
                $pId = (($stId * 3 + $itemIdx) % 100) + 1;
                $p = $products->get($pId);
                $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.40));
                $qty = rand(5, 15);

                $transferItems[] = [
                    'stock_transfer_id' => $stId,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'quantity_requested' => $qty,
                    'quantity_sent' => $qty,
                    'quantity_received' => $qty,
                    'notes' => 'Dispatched via logistics van',
                    'created_at' => now()->subDays(20 - $stId),
                    'updated_at' => now()->subDays(20 - $stId),
                ];

                $movements[] = [
                    'company_id' => $companyId,
                    'warehouse_id' => 1,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'user_id' => 1,
                    'reference_type' => 'stock_transfer_out',
                    'reference_id' => $stId,
                    'type' => 'out',
                    'quantity' => $qty,
                    'quantity_before' => 100,
                    'quantity_after' => 100 - $qty,
                    'unit_cost' => $cost,
                    'notes' => 'Transferred out to WH-002',
                    'created_at' => now()->subDays(20 - $stId),
                    'updated_at' => now()->subDays(20 - $stId),
                ];

                $movements[] = [
                    'company_id' => $companyId,
                    'warehouse_id' => 2,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'user_id' => 1,
                    'reference_type' => 'stock_transfer_in',
                    'reference_id' => $stId,
                    'type' => 'in',
                    'quantity' => $qty,
                    'quantity_before' => 50,
                    'quantity_after' => 50 + $qty,
                    'unit_cost' => $cost,
                    'notes' => 'Transferred in from WH-001',
                    'created_at' => now()->subDays(20 - $stId),
                    'updated_at' => now()->subDays(20 - $stId),
                ];
            }
        }
        DB::table('stock_transfers')->insert($transfers);
        DB::table('stock_transfer_items')->insert($transferItems);

        // 4. Stock Opnames (15 records)
        $opnames = [];
        $opnameItems = [];
        for ($opId = 1; $opId <= 15; $opId++) {
            $opnames[] = [
                'id' => $opId,
                'company_id' => $companyId,
                'warehouse_id' => 1,
                'user_id' => 1,
                'reference_number' => 'OPN-' . date('Ymd') . '-' . str_pad($opId, 4, '0', STR_PAD_LEFT),
                'date' => now()->subDays(25 - $opId)->format('Y-m-d'),
                'notes' => 'Monthly stock take audit ' . $opId,
                'status' => 'done',
                'completed_at' => now()->subDays(25 - $opId)->addHours(4),
                'created_at' => now()->subDays(25 - $opId),
                'updated_at' => now()->subDays(25 - $opId),
            ];

            for ($itemIdx = 1; $itemIdx <= 2; $itemIdx++) {
                $pId = (($opId * 5 + $itemIdx) % 100) + 1;
                $p = $products->get($pId);
                $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.50));
                $sysQty = rand(40, 60);
                $physQty = $sysQty + rand(-2, 2);
                $diff = $physQty - $sysQty;

                $opnameItems[] = [
                    'stock_opname_id' => $opId,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'system_quantity' => $sysQty,
                    'physical_quantity' => $physQty,
                    'difference' => $diff,
                    'notes' => 'Physical barcode verification check',
                    'created_at' => now()->subDays(25 - $opId),
                    'updated_at' => now()->subDays(25 - $opId),
                ];

                if ($diff !== 0) {
                    $movements[] = [
                        'company_id' => $companyId,
                        'warehouse_id' => 1,
                        'product_id' => $pId,
                        'product_variant_id' => null,
                        'user_id' => 1,
                        'reference_type' => 'stock_opname',
                        'reference_id' => $opId,
                        'type' => $diff > 0 ? 'in' : 'out',
                        'quantity' => abs($diff),
                        'quantity_before' => $sysQty,
                        'quantity_after' => $physQty,
                        'unit_cost' => $cost,
                        'notes' => 'Opname adjustment discrepancy',
                        'created_at' => now()->subDays(25 - $opId),
                        'updated_at' => now()->subDays(25 - $opId),
                    ];
                }
            }
        }
        DB::table('stock_opnames')->insert($opnames);
        DB::table('stock_opname_items')->insert($opnameItems);

        // 5. Insert additional historical buffer movements to reach 550+ ledger movements
        while (count($movements) < 550) {
            $pId = rand(1, 100);
            $p = $products->get($pId);
            $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.30));
            $qty = rand(5, 20);
            $movements[] = [
                'company_id' => $companyId,
                'warehouse_id' => rand(1, 2),
                'product_id' => $pId,
                'product_variant_id' => null,
                'user_id' => 1,
                'reference_type' => 'stock_movement',
                'reference_id' => null,
                'type' => rand(0, 1) === 0 ? 'in' : 'out',
                'quantity' => $qty,
                'quantity_before' => 100,
                'quantity_after' => rand(0, 1) === 0 ? (100 + $qty) : (100 - $qty),
                'unit_cost' => $cost,
                'notes' => 'Historical stock rebalance',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()->subDays(rand(1, 60)),
            ];
        }

        foreach (array_chunk($movements, 100) as $chunk) {
            DB::table('inventory_movements')->insert($chunk);
        }

        if (DB::getDriverName() === 'pgsql') {
            $tables = ['inventories', 'stock_adjustments', 'stock_adjustment_items', 'stock_transfers', 'stock_transfer_items', 'stock_opnames', 'stock_opname_items', 'inventory_movements'];
            foreach ($tables as $table) {
                try {
                    DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false);");
                } catch (\Throwable $e) {}
            }
        }
    }
}
