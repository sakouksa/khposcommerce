<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use App\Models\Company\Warehouse;
use App\Models\Customer\Customer;
use App\Models\Product\Product;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;
        $branchId = Branch::value('id') ?? 1;
        $storeId = Store::value('id') ?? 1;
        $warehouseId = Warehouse::value('id') ?? 1;

        // 1. Payment Methods (Authentic Cambodian & Global Channels)
        $paymentMethodsData = [
            ['id' => 1, 'name' => 'ABA KHQR / Mobile',          'code' => 'aba_khqr',         'type' => 'qris',         'fee_percent' => 0.00, 'fee_fixed' => 0.00],
            ['id' => 2, 'name' => 'ACLEDA Mobile / Bank Transfer','code' => 'acleda_mobile',    'type' => 'bank_transfer','fee_percent' => 0.00, 'fee_fixed' => 0.00],
            ['id' => 3, 'name' => 'Wing Bank / WingPay',         'code' => 'wing_bank',        'type' => 'ewallet',      'fee_percent' => 0.00, 'fee_fixed' => 0.00],
            ['id' => 4, 'name' => 'Cash on Delivery (COD)',      'code' => 'cod',              'type' => 'cash',         'fee_percent' => 0.00, 'fee_fixed' => 0.00],
            ['id' => 5, 'name' => 'Credit / Debit Card (Visa/MC)','code' => 'credit_card',      'type' => 'credit_card',  'fee_percent' => 2.50, 'fee_fixed' => 0.25],
            ['id' => 6, 'name' => 'Bakong KHQR (National QR)',   'code' => 'bakong_khqr',      'type' => 'qris',         'fee_percent' => 0.00, 'fee_fixed' => 0.00],
            ['id' => 7, 'name' => 'Canadia Smart Pay',           'code' => 'canadia_pay',      'type' => 'bank_transfer','fee_percent' => 0.00, 'fee_fixed' => 0.00],
            ['id' => 8, 'name' => 'Sathapana Pay Mobile',        'code' => 'sathapana_pay',    'type' => 'bank_transfer','fee_percent' => 0.00, 'fee_fixed' => 0.00],
            ['id' => 9, 'name' => 'TrueMoney Cambodia Wallet',   'code' => 'truemoney_kh',     'type' => 'ewallet',      'fee_percent' => 0.00, 'fee_fixed' => 0.00],
            ['id' => 10,'name' => 'POS Cash Counter',            'code' => 'pos_cash',         'type' => 'cash',         'fee_percent' => 0.00, 'fee_fixed' => 0.00],
        ];

        $paymentMethods = [];
        foreach ($paymentMethodsData as $pm) {
            $paymentMethods[] = [
                'id' => $pm['id'],
                'company_id' => $companyId,
                'name' => $pm['name'],
                'code' => $pm['code'],
                'type' => $pm['type'],
                'logo' => "payments/" . $pm['code'] . ".png",
                'config' => null,
                'fee_percent' => $pm['fee_percent'],
                'fee_fixed' => $pm['fee_fixed'],
                'is_active' => true,
                'available_pos' => true,
                'available_online' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('payment_methods')->upsert($paymentMethods, ['id'], ['company_id', 'name', 'code', 'type', 'logo', 'fee_percent', 'fee_fixed', 'is_active', 'available_pos', 'available_online', 'updated_at']);

        // 2. Shipping Methods (Authentic Cambodian Logistics Providers)
        $providers = [
            ['name' => 'Virak Buntham Logistics (VET)', 'code' => 'vet_express',       'provider' => 'Virak Buntham',   'base_price' => 0.25],
            ['name' => 'J&T Express Cambodia',          'code' => 'jnt_cambodia',      'provider' => 'J&T Express',     'base_price' => 0.20],
            ['name' => 'GrabExpress Phnom Penh Instant', 'code' => 'grab_express',      'provider' => 'GrabExpress',     'base_price' => 0.35],
            ['name' => 'Capitol Tour Express Delivery', 'code' => 'capitol_express',   'provider' => 'Capitol Express', 'base_price' => 0.20],
            ['name' => 'Kerry Express Cambodia',        'code' => 'kerry_express',     'provider' => 'Kerry Express',   'base_price' => 0.25],
            ['name' => 'ZTO Express Cambodia',          'code' => 'zto_express',       'provider' => 'ZTO Express',     'base_price' => 0.20],
            ['name' => 'Speedwind Express Logistics',   'code' => 'speedwind_express', 'provider' => 'Speedwind',       'base_price' => 0.22],
            ['name' => 'Central SuperStore Store Pickup','code' => 'store_pickup',      'provider' => 'Self-Pickup',     'base_price' => 0.00],
            ['name' => 'Phnom Penh Same-Day Courier',   'code' => 'pp_sameday',        'provider' => 'Express Courier', 'base_price' => 0.30],
            ['name' => 'DHL Express International',     'code' => 'dhl_express',       'provider' => 'DHL Express',     'base_price' => 0.50],
        ];

        $shippingMethods = [];
        foreach ($providers as $i => $prov) {
            $shippingMethods[] = [
                'id' => $i + 1,
                'company_id' => $companyId,
                'name' => $prov['name'],
                'code' => $prov['code'],
                'provider' => $prov['provider'],
                'base_price' => $prov['base_price'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('shipping_methods')->upsert($shippingMethods, ['id'], ['company_id', 'name', 'code', 'provider', 'base_price', 'is_active', 'updated_at']);

        // 3. Shipping Zones (10 Authentic Cambodian Geo Zones)
        $shippingZones = [
            ['id' => 1,  'name' => 'Phnom Penh Metropolitan Area',      'provs' => ['Phnom Penh'], 'cities' => ['Khan Sen Sok', 'Khan Tuol Kouk', 'Khan Daun Penh', 'Khan Chamkarmon', 'Khan Boeng Keng Kang']],
            ['id' => 2,  'name' => 'Kandal Greater Capital Belt',       'provs' => ['Kandal'],     'cities' => ['Krong Ta Khmau', 'Kien Svay', 'Ang Snuol']],
            ['id' => 3,  'name' => 'Siem Reap Tourism & Business Zone', 'provs' => ['Siem Reap'],  'cities' => ['Krong Siem Reap', 'Prasat Bakong']],
            ['id' => 4,  'name' => 'Battambang Northwestern Trade Zone', 'provs' => ['Battambang'], 'cities' => ['Krong Battambang', 'Moung Ruessei']],
            ['id' => 5,  'name' => 'Sihanoukville Deep Sea Port Hub',   'provs' => ['Sihanoukville (Preah Sihanouk)'], 'cities' => ['Krong Preah Sihanouk', 'Preah Sihanouk Port']],
            ['id' => 6,  'name' => 'Kampong Cham & Mekong Basin',       'provs' => ['Kampong Cham', 'Tbong Khmum'], 'cities' => ['Krong Kampong Cham', 'Krong Suong']],
            ['id' => 7,  'name' => 'Kampot & Kep Southern Coastal Corridor','provs' => ['Kampot', 'Kep'], 'cities' => ['Krong Kampot', 'Krong Kep']],
            ['id' => 8,  'name' => 'Banteay Meanchey & Poipet Gateway', 'provs' => ['Banteay Meanchey'], 'cities' => ['Krong Poipet', 'Krong Serei Saophoan']],
            ['id' => 9,  'name' => 'Svay Rieng & Bavet SEZ Border Hub', 'provs' => ['Svay Rieng'], 'cities' => ['Krong Bavet', 'Krong Svay Rieng']],
            ['id' => 10, 'name' => 'Northeastern Eco & Mining Zone',     'provs' => ['Ratanakiri', 'Mondulkiri', 'Kratie', 'Stung Treng'], 'cities' => ['Krong Banlung', 'Krong Senmonorom', 'Krong Kratie', 'Krong Stung Treng']],
        ];

        $zonesData = [];
        foreach ($shippingZones as $sz) {
            $zonesData[] = [
                'id' => $sz['id'],
                'company_id' => $companyId,
                'name' => $sz['name'],
                'countries' => json_encode(['Cambodia']),
                'provinces' => json_encode($sz['provs']),
                'cities' => json_encode($sz['cities']),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('shipping_zones')->upsert($zonesData, ['id'], ['company_id', 'name', 'countries', 'provinces', 'cities', 'updated_at']);

        // 4. Shipping Rates (10 records)
        $shippingRates = [];
        for ($i = 1; $i <= 10; $i++) {
            $shippingRates[] = [
                'shipping_method_id' => $i,
                'shipping_zone_id' => $i,
                'min_weight' => 0.000,
                'max_weight' => 15.000,
                'price' => $i === 8 ? 0.00 : round(0.10 + ($i * 0.03), 2),
                'estimated_days_min' => $i === 1 ? 1 : 2,
                'estimated_days_max' => $i === 1 ? 1 : 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('shipping_rates')->truncate();
        DB::table('shipping_rates')->insert($shippingRates);

        // 5. Wishlists (20 records)
        $wishlists = [];
        for ($i = 1; $i <= 20; $i++) {
            $wishlists[] = [
                'customer_id' => ($i % 50) + 1,
                'product_id' => rand(1, 100),
                'product_variant_id' => null,
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now(),
            ];
        }
        DB::table('wishlists')->truncate();
        DB::table('wishlists')->insert($wishlists);

        // Fetch products and customers for relational data integrity
        $products = DB::table('products')->select('id', 'name', 'sku', 'selling_price', 'cost_price')->get()->keyBy('id');
        $customerList = DB::table('customers')->select('id', 'name', 'phone', 'email')->get()->keyBy('id');

        // 6. POS Sales (150 sales) and Sale Items (600 items total)
        DB::table('sale_return_items')->truncate();
        DB::table('sale_returns')->truncate();
        DB::table('sale_items')->truncate();
        DB::table('sales')->truncate();

        $sales = [];
        $saleItems = [];
        $saleItemCount = 1;
        
        $saleReturns = [];
        $saleReturnItems = [];

        $payments = [];
        $paymentCount = 1;

        $transactions = [];
        $transactionCount = 1;

        for ($sId = 1; $sId <= 150; $sId++) {
            $subtotal = 0;
            $tempSaleItems = [];
            $customerId = (($sId - 1) % 100) + 1;
            $itemsCount = rand(2, 4);

            for ($itemIdx = 1; $itemIdx <= $itemsCount; $itemIdx++) {
                $pId = (($sId * 3 + $itemIdx) % 100) + 1;
                $p = $products->get($pId);
                $unitPrice = $p ? (float) $p->selling_price : 0.45;
                $pName = $p ? $p->name : "Enterprise Product $pId";
                $pSku = $p ? $p->sku : "SKU-PROD-$pId";

                $qty = rand(1, 3);
                $discPercent = ($sId % 5 === 0) ? 5.0000 : 0.0000;
                $discAmt = round(($qty * $unitPrice) * ($discPercent / 100), 2);
                $taxPercent = 10.0000; // Cambodia standard VAT 10%
                $taxableAmt = ($qty * $unitPrice) - $discAmt;
                $taxAmt = round($taxableAmt * ($taxPercent / 100), 2);
                $itemSubtotal = round($qty * $unitPrice, 2);
                $itemTotal = round($itemSubtotal - $discAmt + $taxAmt, 2);

                $subtotal += $itemTotal;

                $tempSaleItems[] = [
                    'id' => $saleItemCount++,
                    'sale_id' => $sId,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'product_name' => $pName,
                    'sku' => $pSku,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'discount_percent' => $discPercent,
                    'discount_amount' => $discAmt,
                    'tax_percent' => $taxPercent,
                    'tax_amount' => $taxAmt,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemTotal,
                    'created_at' => now()->subDays(60 - ($sId / 3)),
                    'updated_at' => now()->subDays(60 - ($sId / 3)),
                ];
            }

            $discountAmount = ($sId % 8 === 0) ? round($subtotal * 0.05, 2) : 0.00;
            $taxAmount = round(($subtotal - $discountAmount) * 0.10, 2);
            $grandTotal = round($subtotal - $discountAmount + $taxAmount, 2);
            
            $status = ($sId % 25 === 0) ? 'cancelled' : (($sId % 25 === 1) ? 'refunded' : 'completed');
            $paidAmount = ($status === 'completed') ? $grandTotal : 0.00;
            $paymentMethodId = (($sId - 1) % 10) + 1;

            // Generate realistic dates: yesterday, this month, and past periods (keep today clean for fresh operations)
            if ($sId >= 136) {
                $saleDate = now()->subDays(1)->subHours(($sId - 136) % 14 + 1)->subMinutes(($sId * 7) % 60);
            } elseif ($sId >= 101) {
                $saleDate = now()->subDays((($sId - 101) % 4) + 1)->subHours((($sId * 3) % 10) + 1);
            } else {
                $saleDate = now()->subDays((int)(6 + (100 - $sId) / 1.8));
            }

            $sales[] = [
                'id' => $sId,
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'store_id' => $storeId,
                'warehouse_id' => $warehouseId,
                'customer_id' => $customerId,
                'user_id' => 1,
                'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad($sId, 6, '0', STR_PAD_LEFT),
                'date' => $saleDate->format('Y-m-d H:i:s'),
                'status' => $status,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'grand_total' => $grandTotal,
                'paid_amount' => $paidAmount,
                'change_amount' => 0.00,
                'currency_code' => 'USD',
                'payment_method_id' => $paymentMethodId,
                'notes' => 'Store POS transaction ' . $sId,
                'created_at' => $saleDate,
                'updated_at' => $saleDate,
            ];

            foreach ($tempSaleItems as $item) {
                $saleItems[] = $item;
            }

            // Create payments and transactions for completed POS sales
            if ($status === 'completed') {
                $pIdVal = $paymentCount++;
                $payments[] = [
                    'id' => $pIdVal,
                    'company_id' => $companyId,
                    'payment_method_id' => $paymentMethodId,
                    'payable_type' => 'App\Models\Sales\Sale',
                    'payable_id' => $sId,
                    'transaction_id' => 'TXN-POS-' . $sId . '-' . mt_rand(1000, 9999),
                    'reference_number' => 'REF-' . mt_rand(100000, 999999),
                    'amount' => $grandTotal,
                    'fee_amount' => ($paymentMethodId === 5) ? round($grandTotal * 0.025, 2) : 0.00,
                    'currency_code' => 'USD',
                    'status' => 'completed',
                    'gateway_response' => json_encode(['auth_code' => 'AUTH' . mt_rand(10000, 99999), 'channel' => 'POS-KHQR-USD']),
                    'paid_at' => now()->subDays(60 - ($sId / 3)),
                    'notes' => 'Settled payment for POS invoice ' . $sId,
                    'created_at' => now()->subDays(60 - ($sId / 3)),
                    'updated_at' => now()->subDays(60 - ($sId / 3)),
                ];

                $transactions[] = [
                    'id' => $transactionCount++,
                    'company_id' => $companyId,
                    'payment_id' => $pIdVal,
                    'type' => 'debit',
                    'amount' => $grandTotal,
                    'description' => 'Received payment from POS invoice ' . $sId,
                    'reference_type' => 'App\Models\Sales\Sale',
                    'reference_id' => $sId,
                    'created_at' => now()->subDays(60 - ($sId / 3)),
                    'updated_at' => now()->subDays(60 - ($sId / 3)),
                ];
            }

            // Create returns (10 sale returns)
            if ($status === 'refunded' && count($saleReturns) < 10) {
                $retItem = $tempSaleItems[0];
                $retQty = 1;
                $retTotal = round($retQty * $retItem['unit_price'], 2);
                $srIdVal = count($saleReturns) + 1;

                $saleReturns[] = [
                    'id' => $srIdVal,
                    'company_id' => $companyId,
                    'sale_id' => $sId,
                    'user_id' => 1,
                    'reference_number' => 'SRT-' . date('Ymd') . '-' . str_pad($srIdVal, 4, '0', STR_PAD_LEFT),
                    'date' => now()->subDays(60 - ($sId / 3))->addDays(2)->format('Y-m-d H:i:s'),
                    'total_amount' => $retTotal,
                    'refund_amount' => $retTotal,
                    'refund_method' => 'cash',
                    'reason' => 'Customer return: changed device model preference within 7-day exchange warranty.',
                    'status' => 'approved',
                    'created_at' => now()->subDays(60 - ($sId / 3))->addDays(2),
                    'updated_at' => now()->subDays(60 - ($sId / 3))->addDays(2),
                ];

                $saleReturnItems[] = [
                    'id' => count($saleReturnItems) + 1,
                    'sale_return_id' => $srIdVal,
                    'sale_item_id' => $retItem['id'],
                    'product_id' => $retItem['product_id'],
                    'product_variant_id' => null,
                    'quantity' => $retQty,
                    'unit_price' => $retItem['unit_price'],
                    'total' => $retTotal,
                    'notes' => 'Product returned unopened with complete box accessories.',
                    'created_at' => now()->subDays(60 - ($sId / 3))->addDays(2),
                    'updated_at' => now()->subDays(60 - ($sId / 3))->addDays(2),
                ];
            }
        }
        
        DB::table('sales')->insert($sales);
        foreach (array_chunk($saleItems, 100) as $chunk) {
            DB::table('sale_items')->insert($chunk);
        }
        if (!empty($saleReturns)) {
            DB::table('sale_returns')->insert($saleReturns);
            DB::table('sale_return_items')->insert($saleReturnItems);
        }

        // Update Customers' total_spent, order_count, loyalty_points based on completed sales
        $customerSalesStats = DB::table('sales')
            ->where('status', 'completed')
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->select(
                'customer_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(grand_total) as total_spent')
            )
            ->get();

        foreach ($customerSalesStats as $stat) {
            $spent = (float) $stat->total_spent;
            $points = (int) round($spent);
            DB::table('customers')->where('id', $stat->customer_id)->update([
                'total_spent'    => $spent,
                'order_count'    => (int) $stat->order_count,
                'loyalty_points' => $points,
            ]);
        }

        // 7. Cash Registers & Register Transactions (10 registers)
        DB::table('cash_register_transactions')->truncate();
        DB::table('cash_registers')->truncate();
        $cashRegisters = [];
        $crTransactions = [];
        $crTxCount = 1;
        for ($crId = 1; $crId <= 10; $crId++) {
            $openBal = 150.00 + ($crId * 15.00);
            $closeBal = $openBal + 200.00 + ($crId * 25.00);
            $cashRegisters[] = [
                'id' => $crId,
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'store_id' => $storeId,
                'name' => "POS Register Station " . str_pad($crId, 2, '0', STR_PAD_LEFT),
                'code' => "REG-00$crId",
                'status' => 'open',
                'opening_balance' => $openBal,
                'closing_balance' => $closeBal,
                'expected_balance' => $closeBal,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Open cash register transaction with USD float
            $crTransactions[] = [
                'id' => $crTxCount++,
                'cash_register_id' => $crId,
                'user_id' => 1,
                'type' => 'open',
                'amount' => 150.00, // Open float $150 USD
                'balance_before' => 0.00,
                'balance_after' => 150.00,
                'reference_type' => null,
                'reference_id' => null,
                'notes' => 'Register opened with standard opening float ($150 USD)',
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ];
        }
        DB::table('cash_registers')->insert($cashRegisters);
        DB::table('cash_register_transactions')->insert($crTransactions);

        // 8. E-Commerce Orders (150 orders) and Order Items
        DB::table('order_status_histories')->truncate();
        DB::table('shipments')->truncate();
        DB::table('order_items')->truncate();
        DB::table('orders')->truncate();

        $orders = [];
        $orderItems = [];
        $orderItemCount = 1;
        
        $shipments = [];
        $shipmentCount = 1;

        $orderHistories = [];
        $ohCount = 1;

        for ($oId = 1; $oId <= 150; $oId++) {
            $subtotal = 0;
            $itemsInOrder = rand(2, 3);
            $tempOrderItems = [];
            $customerId = (($oId - 1) % 100) + 1;
            $cust = $customerList->get($customerId);
            $custName = $cust ? $cust->name : "Customer $customerId";
            $custPhone = $cust ? $cust->phone : "012 888 " . str_pad($oId, 3, '0', STR_PAD_LEFT);
            
            for ($itemIdx = 1; $itemIdx <= $itemsInOrder; $itemIdx++) {
                $pId = (($oId * 2 + $itemIdx) % 100) + 1;
                $p = $products->get($pId);
                $unitPrice = $p ? (float) $p->selling_price : 0.45;
                $pName = $p ? $p->name : "Digital Device $pId";
                $pSku = $p ? $p->sku : "SKU-ONLINE-$pId";
                
                $qty = rand(1, 2);
                $discAmt = ($oId % 6 === 0) ? round(($qty * $unitPrice) * 0.05, 2) : 0.00;
                $taxAmt = round((($qty * $unitPrice) - $discAmt) * 0.10, 2);
                $itemSubtotal = round($qty * $unitPrice, 2);
                $itemTotal = round($itemSubtotal - $discAmt + $taxAmt, 2);

                $subtotal += $itemTotal;

                $tempOrderItems[] = [
                    'id' => $orderItemCount++,
                    'order_id' => $oId,
                    'product_id' => $pId,
                    'product_variant_id' => null,
                    'product_name' => $pName,
                    'product_sku' => $pSku,
                    'product_image' => "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'discount_amount' => $discAmt,
                    'tax_amount' => $taxAmt,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemTotal,
                    'created_at' => now()->subDays(60 - ($oId / 3.5)),
                    'updated_at' => now()->subDays(60 - ($oId / 3.5)),
                ];
            }

            $discountAmount = ($oId % 7 === 0) ? round($subtotal * 0.05, 2) : 0.00;
            $taxAmount = round(($subtotal - $discountAmount) * 0.10, 2);
            $shippingCost = round(0.15 + (($oId % 5) * 0.04), 2); // $0.15 to $0.31 USD
            $grandTotal = round($subtotal - $discountAmount + $taxAmount + $shippingCost, 2);

            $status = ($oId % 12 === 0) ? 'cancelled' : (($oId % 12 === 1) ? 'pending' : 'completed');
            $paymentStatus = ($status === 'completed') ? 'paid' : 'unpaid';
            $city = ($oId % 3 === 0) ? 'Krong Siem Reap' : (($oId % 3 === 1) ? 'Krong Battambang' : 'Khan Sen Sok');
            $province = ($oId % 3 === 0) ? 'Siem Reap' : (($oId % 3 === 1) ? 'Battambang' : 'Phnom Penh');

            $orders[] = [
                'id' => $oId,
                'company_id' => $companyId,
                'store_id' => $storeId,
                'customer_id' => $customerId,
                'warehouse_id' => $warehouseId,
                'order_number' => 'ORD-' . date('Ymd') . '-' . str_pad($oId, 6, '0', STR_PAD_LEFT),
                'status' => $status,
                'payment_status' => $paymentStatus,
                'fulfillment_status' => ($status === 'completed') ? 'fulfilled' : 'unfulfilled',
                'shipping_name' => $custName,
                'shipping_phone' => $custPhone,
                'shipping_address' => "#" . (($oId * 7) % 500 + 1) . ", Street " . (($oId % 300) + 1) . ", Sangkat " . (($oId % 6) + 1),
                'shipping_city' => $city,
                'shipping_province' => $province,
                'shipping_country' => 'Cambodia',
                'shipping_postal_code' => '120' . str_pad($oId % 100, 2, '0', STR_PAD_LEFT),
                'shipping_method_id' => (($oId - 1) % 5) + 1,
                'shipping_cost' => $shippingCost,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'grand_total' => $grandTotal,
                'paid_amount' => ($paymentStatus === 'paid') ? $grandTotal : 0.00,
                'coupon_code' => ($discountAmount > 0) ? 'TECHPROMO' : null,
                'currency_code' => 'USD',
                'exchange_rate' => 1.000000,
                'customer_notes' => 'Please call recipient before delivery.',
                'admin_notes' => 'Dispatched from Central Logistics Hub.',
                'created_at' => now()->subDays(60 - ($oId / 3.5)),
                'updated_at' => now()->subDays(60 - ($oId / 3.5)),
            ];

            foreach ($tempOrderItems as $item) {
                $orderItems[] = $item;
            }

            // Shipments (150 shipments)
            $carrier = ($oId % 3 === 0) ? 'Virak Buntham Logistics' : (($oId % 3 === 1) ? 'J&T Express Cambodia' : 'GrabExpress');
            $shipments[] = [
                'id' => $shipmentCount++,
                'order_id' => $oId,
                'shipping_method_id' => (($oId - 1) % 5) + 1,
                'tracking_number' => 'TRK-' . mt_rand(10000000, 99999999),
                'carrier' => $carrier,
                'status' => ($status === 'completed') ? 'delivered' : 'pending',
                'shipped_at' => ($status === 'completed') ? now()->subDays(60 - ($oId / 3.5))->addHours(6) : null,
                'delivered_at' => ($status === 'completed') ? now()->subDays(60 - ($oId / 3.5))->addDays(2) : null,
                'created_at' => now()->subDays(60 - ($oId / 3.5)),
                'updated_at' => now()->subDays(60 - ($oId / 3.5)),
            ];

            // Order status history
            $orderHistories[] = [
                'id' => $ohCount++,
                'order_id' => $oId,
                'user_id' => 1,
                'status' => 'pending',
                'comment' => 'Order placed online and registered into system.',
                'notify_customer' => true,
                'created_at' => now()->subDays(60 - ($oId / 3.5)),
                'updated_at' => now()->subDays(60 - ($oId / 3.5)),
            ];

            if ($status === 'completed') {
                $orderHistories[] = [
                    'id' => $ohCount++,
                    'order_id' => $oId,
                    'user_id' => 1,
                    'status' => 'completed',
                    'comment' => 'Order package delivered and payment confirmed.',
                    'notify_customer' => true,
                    'created_at' => now()->subDays(60 - ($oId / 3.5))->addDays(2),
                    'updated_at' => now()->subDays(60 - ($oId / 3.5))->addDays(2),
                ];

                // Create payment & transaction for E-commerce order
                $pIdVal = $paymentCount++;
                $payMethodId = (($oId % 4) + 1); // ABA KHQR, ACLEDA, Wing, COD
                $payments[] = [
                    'id' => $pIdVal,
                    'company_id' => $companyId,
                    'payment_method_id' => $payMethodId,
                    'payable_type' => 'App\Models\Order\Order',
                    'payable_id' => $oId,
                    'transaction_id' => 'TXN-ECOMM-' . $oId . '-' . mt_rand(1000, 9999),
                    'reference_number' => 'REF-ECOMM-' . mt_rand(100000, 999999),
                    'amount' => $grandTotal,
                    'fee_amount' => 0.00,
                    'currency_code' => 'USD',
                    'status' => 'completed',
                    'gateway_response' => json_encode(['auth_code' => 'ABA' . mt_rand(10000, 99999), 'channel' => 'KHQR-GATEWAY']),
                    'paid_at' => now()->subDays(60 - ($oId / 3.5)),
                    'notes' => 'E-Commerce payment settlement for order ' . $oId,
                    'created_at' => now()->subDays(60 - ($oId / 3.5)),
                    'updated_at' => now()->subDays(60 - ($oId / 3.5)),
                ];

                $transactions[] = [
                    'id' => $transactionCount++,
                    'company_id' => $companyId,
                    'payment_id' => $pIdVal,
                    'type' => 'debit',
                    'amount' => $grandTotal,
                    'description' => 'Received online settlement for order ' . $oId,
                    'reference_type' => 'App\Models\Order\Order',
                    'reference_id' => $oId,
                    'created_at' => now()->subDays(60 - ($oId / 3.5)),
                    'updated_at' => now()->subDays(60 - ($oId / 3.5)),
                ];
            }
        }

        DB::table('orders')->insert($orders);
        foreach (array_chunk($orderItems, 100) as $chunk) {
            DB::table('order_items')->insert($chunk);
        }
        DB::table('shipments')->insert($shipments);
        DB::table('order_status_histories')->insert($orderHistories);
        
        // Batch insert payments & transactions
        DB::table('payments')->truncate();
        DB::table('transactions')->truncate();
        DB::table('payments')->insert($payments);
        DB::table('transactions')->insert($transactions);

        if (DB::getDriverName() === 'pgsql') {
            $tables = ['payment_methods', 'shipping_methods', 'shipping_zones', 'shipping_rates', 'wishlists', 'sales', 'sale_items', 'sale_returns', 'sale_return_items', 'cash_registers', 'cash_register_transactions', 'orders', 'order_items', 'shipments', 'order_status_histories', 'payments', 'transactions'];
            foreach ($tables as $table) {
                try {
                    DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false);");
                } catch (\Throwable $e) {}
            }
        }
    }
}
