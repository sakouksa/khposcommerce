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
        $variants = DB::table('product_variants')->get();

        $inventories = [];
        $movements = [];

        // ─── 1. Seed Initial Inventories across 3 Warehouses (Branch A has the most!) ───
        // Warehouse 1 (Branch A - Phnom Penh HQ): ALL 100 products, large stock (120 - 300 pcs)
        for ($pId = 1; $pId <= 100; $pId++) {
            $qty = rand(120, 300);
            $p = $products->get($pId);
            $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.45));

            $inventories[] = [
                'company_id'         => $companyId,
                'warehouse_id'       => 1,
                'product_id'         => $pId,
                'product_variant_id' => null,
                'quantity'           => $qty,
                'reserved_quantity'  => 0,
                'reorder_point'      => 10,
                'reorder_qty'        => 50,
                'created_at'         => now(),
                'updated_at'         => now(),
            ];

            $movements[] = [
                'company_id'      => $companyId,
                'warehouse_id'    => 1,
                'product_id'      => $pId,
                'product_variant_id' => null,
                'user_id'         => 1,
                'reference_type'  => 'opening_balance',
                'reference_id'    => null,
                'type'            => 'in',
                'quantity'        => $qty,
                'quantity_before' => 0,
                'quantity_after'  => $qty,
                'unit_cost'       => $cost,
                'notes'           => 'Initial stock opening balance (Branch A - HQ)',
                'created_at'      => now()->subDays(60),
                'updated_at'      => now()->subDays(60),
            ];
        }

        // Warehouse 2 (Branch B - Tbong Khmum): 75 products, medium stock (40 - 120 pcs)
        for ($pId = 1; $pId <= 75; $pId++) {
            $qty = rand(40, 120);
            $p = $products->get($pId);
            $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.45));

            $inventories[] = [
                'company_id'         => $companyId,
                'warehouse_id'       => 2,
                'product_id'         => $pId,
                'product_variant_id' => null,
                'quantity'           => $qty,
                'reserved_quantity'  => 0,
                'reorder_point'      => 5,
                'reorder_qty'        => 25,
                'created_at'         => now(),
                'updated_at'         => now(),
            ];

            $movements[] = [
                'company_id'      => $companyId,
                'warehouse_id'    => 2,
                'product_id'      => $pId,
                'product_variant_id' => null,
                'user_id'         => 1,
                'reference_type'  => 'opening_balance',
                'reference_id'    => null,
                'type'            => 'in',
                'quantity'        => $qty,
                'quantity_before' => 0,
                'quantity_after'  => $qty,
                'unit_cost'       => $cost,
                'notes'           => 'Initial stock opening balance (Branch B)',
                'created_at'      => now()->subDays(60),
                'updated_at'      => now()->subDays(60),
            ];
        }

        // Warehouse 3 (Branch C - Siem Reap): 50 products, smaller stock (20 - 70 pcs)
        for ($pId = 1; $pId <= 50; $pId++) {
            $qty = rand(20, 70);
            $p = $products->get($pId);
            $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.45));

            $inventories[] = [
                'company_id'         => $companyId,
                'warehouse_id'       => 3,
                'product_id'         => $pId,
                'product_variant_id' => null,
                'quantity'           => $qty,
                'reserved_quantity'  => 0,
                'reorder_point'      => 5,
                'reorder_qty'        => 15,
                'created_at'         => now(),
                'updated_at'         => now(),
            ];

            $movements[] = [
                'company_id'      => $companyId,
                'warehouse_id'    => 3,
                'product_id'      => $pId,
                'product_variant_id' => null,
                'user_id'         => 1,
                'reference_type'  => 'opening_balance',
                'reference_id'    => null,
                'type'            => 'in',
                'quantity'        => $qty,
                'quantity_before' => 0,
                'quantity_after'  => $qty,
                'unit_cost'       => $cost,
                'notes'           => 'Initial stock opening balance (Branch C)',
                'created_at'      => now()->subDays(60),
                'updated_at'      => now()->subDays(60),
            ];
        }

        // Product Variants Inventories across 3 Warehouses
        foreach ($variants as $v) {
            // Warehouse 1 (Branch A): ALL variants, highest quantity
            $inventories[] = [
                'company_id'         => $companyId,
                'warehouse_id'       => 1,
                'product_id'         => $v->product_id,
                'product_variant_id' => $v->id,
                'quantity'           => rand(35, 90),
                'reserved_quantity'  => 0,
                'reorder_point'      => 5,
                'reorder_qty'        => 20,
                'created_at'         => now(),
                'updated_at'         => now(),
            ];

            // Warehouse 2 (Branch B): Variants for products <= 75
            if ($v->product_id <= 75) {
                $inventories[] = [
                    'company_id'         => $companyId,
                    'warehouse_id'       => 2,
                    'product_id'         => $v->product_id,
                    'product_variant_id' => $v->id,
                    'quantity'           => rand(15, 45),
                    'reserved_quantity'  => 0,
                    'reorder_point'      => 3,
                    'reorder_qty'        => 15,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ];
            }

            // Warehouse 3 (Branch C): Variants for products <= 50
            if ($v->product_id <= 50) {
                $inventories[] = [
                    'company_id'         => $companyId,
                    'warehouse_id'       => 3,
                    'product_id'         => $v->product_id,
                    'product_variant_id' => $v->id,
                    'quantity'           => rand(10, 30),
                    'reserved_quantity'  => 0,
                    'reorder_point'      => 2,
                    'reorder_qty'        => 10,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ];
            }
        }

        foreach (array_chunk($inventories, 100) as $chunk) {
            DB::table('inventories')->insert($chunk);
        }

        // ─── 2. Stock Adjustments (20 records: Branch A = 12, Branch B = 5, Branch C = 3) ───
        $adjustments = [];
        $adjustmentItems = [];
        for ($adjId = 1; $adjId <= 20; $adjId++) {
            $wId = $adjId <= 12 ? 1 : ($adjId <= 17 ? 2 : 3);
            $branchCode = $wId === 1 ? 'A' : ($wId === 2 ? 'B' : 'C');

            $adjustments[] = [
                'id'               => $adjId,
                'company_id'       => $companyId,
                'warehouse_id'     => $wId,
                'user_id'          => 1,
                'reference_number' => "ADJ-{$branchCode}-" . date('Ymd') . '-' . str_pad($adjId, 4, '0', STR_PAD_LEFT),
                'date'             => now()->subDays(20 - $adjId)->format('Y-m-d'),
                'type'             => $adjId % 2 === 0 ? 'addition' : 'subtraction',
                'reason'           => "Inventory audit variance adjustment {$adjId} (Branch {$branchCode})",
                'status'           => 'approved',
                'approved_by'      => 1,
                'approved_at'      => now(),
                'created_at'       => now()->subDays(20 - $adjId),
                'updated_at'       => now()->subDays(20 - $adjId),
            ];

            for ($itemIdx = 1; $itemIdx <= 2; $itemIdx++) {
                $maxP = $wId === 1 ? 100 : ($wId === 2 ? 75 : 50);
                $pId = (($adjId * 4 + $itemIdx) % $maxP) + 1;
                $p = $products->get($pId);
                $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.35));
                $adjustedQty = rand(2, 6);

                $adjustmentItems[] = [
                    'stock_adjustment_id' => $adjId,
                    'product_id'          => $pId,
                    'product_variant_id'  => null,
                    'quantity_before'     => 50,
                    'quantity_adjusted'   => $adjustedQty,
                    'quantity_after'      => $adjId % 2 === 0 ? (50 + $adjustedQty) : (50 - $adjustedQty),
                    'notes'               => "Audited by warehouse supervisor (WH-{$wId})",
                    'created_at'          => now()->subDays(20 - $adjId),
                    'updated_at'          => now()->subDays(20 - $adjId),
                ];

                $movements[] = [
                    'company_id'         => $companyId,
                    'warehouse_id'       => $wId,
                    'product_id'         => $pId,
                    'product_variant_id' => null,
                    'user_id'            => 1,
                    'reference_type'     => 'stock_adjustment',
                    'reference_id'       => $adjId,
                    'type'               => $adjId % 2 === 0 ? 'in' : 'out',
                    'quantity'           => $adjustedQty,
                    'quantity_before'    => 50,
                    'quantity_after'     => $adjId % 2 === 0 ? (50 + $adjustedQty) : (50 - $adjustedQty),
                    'unit_cost'          => $cost,
                    'notes'              => "Adjusted via ADJ-{$branchCode}-" . str_pad($adjId, 4, '0', STR_PAD_LEFT),
                    'created_at'         => now()->subDays(20 - $adjId),
                    'updated_at'         => now()->subDays(20 - $adjId),
                ];
            }
        }
        DB::table('stock_adjustments')->insert($adjustments);
        DB::table('stock_adjustment_items')->insert($adjustmentItems);

        // ─── 3. Stock Transfers (20 transfers: WH 1 -> WH 2, WH 1 -> WH 3, WH 2 -> WH 3) ───
        $transfers = [];
        $transferItems = [];
        for ($stId = 1; $stId <= 20; $stId++) {
            if ($stId <= 11) {
                // Phnom Penh HQ (WH 1) -> Tbong Khmum (WH 2)
                $fromW = 1;
                $toW = 2;
                $tDesc = 'Central HQ replenishment to Tbong Khmum (Branch A -> B)';
            } elseif ($stId <= 17) {
                // Phnom Penh HQ (WH 1) -> Siem Reap (WH 3)
                $fromW = 1;
                $toW = 3;
                $tDesc = 'Central HQ replenishment to Siem Reap (Branch A -> C)';
            } else {
                // Tbong Khmum (WH 2) -> Siem Reap (WH 3)
                $fromW = 2;
                $toW = 3;
                $tDesc = 'Regional stock transfer (Branch B -> C)';
            }

            $transfers[] = [
                'id'                => $stId,
                'company_id'        => $companyId,
                'from_warehouse_id' => $fromW,
                'to_warehouse_id'   => $toW,
                'user_id'           => 1,
                'reference_number'  => 'TRF-' . date('Ymd') . '-' . str_pad($stId, 4, '0', STR_PAD_LEFT),
                'date'              => now()->subDays(25 - $stId)->format('Y-m-d'),
                'notes'             => $tDesc,
                'status'            => 'received',
                'shipped_at'        => now()->subDays(25 - $stId)->addHours(2),
                'received_at'       => now()->subDays(25 - $stId)->addHours(6),
                'created_at'        => now()->subDays(25 - $stId),
                'updated_at'        => now()->subDays(25 - $stId),
            ];

            for ($itemIdx = 1; $itemIdx <= 2; $itemIdx++) {
                $maxP = 50;
                $pId = (($stId * 3 + $itemIdx) % $maxP) + 1;
                $p = $products->get($pId);
                $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.40));
                $qty = rand(5, 15);

                $transferItems[] = [
                    'stock_transfer_id' => $stId,
                    'product_id'        => $pId,
                    'product_variant_id'=> null,
                    'quantity_requested'=> $qty,
                    'quantity_sent'     => $qty,
                    'quantity_received' => $qty,
                    'notes'             => 'Dispatched via logistics van (Virak Buntham)',
                    'created_at'        => now()->subDays(25 - $stId),
                    'updated_at'        => now()->subDays(25 - $stId),
                ];

                $movements[] = [
                    'company_id'         => $companyId,
                    'warehouse_id'       => $fromW,
                    'product_id'         => $pId,
                    'product_variant_id' => null,
                    'user_id'            => 1,
                    'reference_type'     => 'stock_transfer_out',
                    'reference_id'       => $stId,
                    'type'               => 'out',
                    'quantity'           => $qty,
                    'quantity_before'    => 100,
                    'quantity_after'     => 100 - $qty,
                    'unit_cost'          => $cost,
                    'notes'              => "Transferred out from WH-00{$fromW} to WH-00{$toW}",
                    'created_at'         => now()->subDays(25 - $stId),
                    'updated_at'         => now()->subDays(25 - $stId),
                ];

                $movements[] = [
                    'company_id'         => $companyId,
                    'warehouse_id'       => $toW,
                    'product_id'         => $pId,
                    'product_variant_id' => null,
                    'user_id'            => 1,
                    'reference_type'     => 'stock_transfer_in',
                    'reference_id'       => $stId,
                    'type'               => 'in',
                    'quantity'           => $qty,
                    'quantity_before'    => 50,
                    'quantity_after'     => 50 + $qty,
                    'unit_cost'          => $cost,
                    'notes'              => "Transferred in to WH-00{$toW} from WH-00{$fromW}",
                    'created_at'         => now()->subDays(25 - $stId),
                    'updated_at'         => now()->subDays(25 - $stId),
                ];
            }
        }
        DB::table('stock_transfers')->insert($transfers);
        DB::table('stock_transfer_items')->insert($transferItems);

        // ─── 4. Stock Opnames (18 records: Branch A = 10, Branch B = 5, Branch C = 3) ───
        $opnames = [];
        $opnameItems = [];
        for ($opId = 1; $opId <= 18; $opId++) {
            $wId = $opId <= 10 ? 1 : ($opId <= 15 ? 2 : 3);
            $branchCode = $wId === 1 ? 'A' : ($wId === 2 ? 'B' : 'C');

            $opnames[] = [
                'id'               => $opId,
                'company_id'       => $companyId,
                'warehouse_id'     => $wId,
                'user_id'          => 1,
                'reference_number' => "OPN-{$branchCode}-" . date('Ymd') . '-' . str_pad($opId, 4, '0', STR_PAD_LEFT),
                'date'             => now()->subDays(25 - $opId)->format('Y-m-d'),
                'notes'            => "Monthly physical stock take audit {$opId} (Branch {$branchCode})",
                'status'           => 'done',
                'completed_at'     => now()->subDays(25 - $opId)->addHours(4),
                'created_at'       => now()->subDays(25 - $opId),
                'updated_at'       => now()->subDays(25 - $opId),
            ];

            for ($itemIdx = 1; $itemIdx <= 2; $itemIdx++) {
                $maxP = $wId === 1 ? 100 : ($wId === 2 ? 75 : 50);
                $pId = (($opId * 5 + $itemIdx) % $maxP) + 1;
                $p = $products->get($pId);
                $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.50));
                $sysQty = rand(40, 60);
                $physQty = $sysQty + rand(-2, 2);
                $diff = $physQty - $sysQty;

                $opnameItems[] = [
                    'stock_opname_id'   => $opId,
                    'product_id'        => $pId,
                    'product_variant_id'=> null,
                    'system_quantity'   => $sysQty,
                    'physical_quantity' => $physQty,
                    'difference'        => $diff,
                    'notes'             => 'Physical barcode verification check',
                    'created_at'        => now()->subDays(25 - $opId),
                    'updated_at'        => now()->subDays(25 - $opId),
                ];

                if ($diff !== 0) {
                    $movements[] = [
                        'company_id'         => $companyId,
                        'warehouse_id'       => $wId,
                        'product_id'         => $pId,
                        'product_variant_id' => null,
                        'user_id'            => 1,
                        'reference_type'     => 'stock_opname',
                        'reference_id'       => $opId,
                        'type'               => $diff > 0 ? 'in' : 'out',
                        'quantity'           => abs($diff),
                        'quantity_before'    => $sysQty,
                        'quantity_after'     => $physQty,
                        'unit_cost'          => $cost,
                        'notes'              => 'Opname adjustment discrepancy',
                        'created_at'         => now()->subDays(25 - $opId),
                        'updated_at'         => now()->subDays(25 - $opId),
                    ];
                }
            }
        }
        DB::table('stock_opnames')->insert($opnames);
        DB::table('stock_opname_items')->insert($opnameItems);

        // ─── 5. Insert additional historical buffer movements (Branch A heavily weighted) ───
        while (count($movements) < 550) {
            // 60% probability for Warehouse 1 (Branch A), 25% for WH 2, 15% for WH 3
            $randWH = rand(1, 100);
            $wId = $randWH <= 60 ? 1 : ($randWH <= 85 ? 2 : 3);
            $maxP = $wId === 1 ? 100 : ($wId === 2 ? 75 : 50);

            $pId = rand(1, $maxP);
            $p = $products->get($pId);
            $cost = min(0.85, max(0.01, $p ? (float) $p->cost_price : 0.30));
            $qty = rand(5, 20);

            $movements[] = [
                'company_id'         => $companyId,
                'warehouse_id'       => $wId,
                'product_id'         => $pId,
                'product_variant_id' => null,
                'user_id'            => 1,
                'reference_type'     => 'stock_movement',
                'reference_id'       => null,
                'type'               => rand(0, 1) === 0 ? 'in' : 'out',
                'quantity'           => $qty,
                'quantity_before'    => 100,
                'quantity_after'     => rand(0, 1) === 0 ? (100 + $qty) : (100 - $qty),
                'unit_cost'          => $cost,
                'notes'              => "Historical stock balance entry (WH-{$wId})",
                'created_at'         => now()->subDays(rand(1, 60)),
                'updated_at'         => now()->subDays(rand(1, 60)),
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
