<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Warehouse;
use App\Models\Customer\Customer;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\OrderReturn;
use App\Models\Order\OrderReturnItem;
use App\Models\Order\ReturnShipment;
use App\Models\Order\ReturnInspection;
use App\Models\Order\ReturnInspectionItem;
use App\Models\Order\ExchangeOrder;
use App\Models\Product\Product;
use App\Models\Sales\Sale;
use App\Models\Shipping\ShippingMethod;
use App\Models\User;

class OrderReturnSeeder extends Seeder
{
    public function run(): void
    {
        // Clear previous test records if any in reverse dependency order (hard delete)
        DB::table('exchange_orders')->delete();
        DB::table('return_inspection_items')->delete();
        DB::table('return_inspections')->delete();
        DB::table('return_shipments')->delete();
        DB::table('order_return_items')->delete();
        DB::table('order_returns')->delete();

        $company = Company::find(1) ?? Company::first();
        if (!$company) {
            $this->command->warn('No company found. Please run CompanySeeder first.');
            return;
        }

        $warehouse = Warehouse::where('company_id', $company->id)->first() ?? Warehouse::first();
        $inspector = User::where('company_id', $company->id)->first() ?? User::first();
        $shippingMethods = ShippingMethod::all();
        $vetMethod = $shippingMethods->firstWhere('name', 'like', '%Virak Buntham%') ?? $shippingMethods->first();
        $jntMethod = $shippingMethods->firstWhere('name', 'like', '%J&T%') ?? $shippingMethods->first();

        // Get actual orders and sales for Company 1
        $orders = Order::where('company_id', $company->id)->with(['customer', 'items.product'])->take(15)->get();
        $sales = Sale::where('company_id', $company->id)->with(['customer', 'items.product'])->take(10)->get();

        if ($orders->isEmpty()) {
            $this->command->warn('No orders found to generate returns from.');
            return;
        }

        $rmaDefinitions = [
            // ─── 1. REQUESTED (រង់ចាំការពិនិត្យ / PENDING REVIEW) ───────────────
            [
                'order_index'    => 0,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0001',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'customer',
                'reason_code'    => 'changed_mind',
                'reason_notes'   => 'អតិថិជនប្តូរចិត្ត មិនត្រូវនឹងតម្រូវការប្រើប្រាស់ជាក់ស្តែង (Customer changed mind, product unopened)',
                'status'         => 'requested',
                'refund_status'  => 'pending',
                'refund_method'  => 'bakong_khqr',
                'refund_account' => [
                    'bank_name'      => 'ABA Bank (Bakong KHQR)',
                    'account_name'   => 'MEAS SREYPOV',
                    'account_number' => '001 882 109',
                    'phone'          => '012 345 678',
                ],
                'restocking_rate'=> 0.05, // 5%
                'shipping_fee'   => 0.05,
                'days_ago'       => 1,
            ],
            [
                'order_index'    => 1,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0002',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'store',
                'reason_code'    => 'defective',
                'reason_notes'   => 'អេក្រង់ឆ្នូត និងមានបញ្ហា flickering ពេលបើកដំបូង (Screen flickering on initial boot, manufacturer defect)',
                'status'         => 'requested',
                'refund_status'  => 'pending',
                'refund_method'  => 'original_payment',
                'refund_account' => [
                    'bank_name'      => 'ACLEDA Bank',
                    'account_name'   => 'CHAN VANNA',
                    'account_number' => '010 445 921',
                    'phone'          => '089 912 003',
                ],
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 2,
            ],
            [
                'order_index'    => 0,
                'is_sale'        => true, // From POS
                'return_number'  => 'RMA-202609-0003',
                'type'           => 'return',
                'channel'        => 'pos',
                'fault'          => 'customer',
                'reason_code'    => 'wrong_variant_selected',
                'reason_notes'   => 'ទិញច្រឡំទំហំ Ram/Storage ចង់សងប្រាក់វិញដើម្បីទិញម៉ូដែលផ្សេង (Bought wrong storage spec)',
                'status'         => 'requested',
                'refund_status'  => 'pending',
                'refund_method'  => 'store_credit',
                'refund_account' => null,
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 1,
            ],

            // ─── 2. APPROVED (បានអនុម័ត - រង់ចាំផ្ញើទំនិញ) ────────────────────────
            [
                'order_index'    => 2,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0004',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'customer',
                'reason_code'    => 'changed_mind',
                'reason_notes'   => 'ប្រអប់មិនទាន់ហែក មានវិក្កយបត្រត្រឹមត្រូវ អតិថិជនយល់ព្រមបង់ថ្លៃសេវាដឹក (Unopened with original seal)',
                'status'         => 'approved',
                'refund_status'  => 'pending',
                'refund_method'  => 'bakong_khqr',
                'refund_account' => [
                    'bank_name'      => 'Wing Bank (KHQR)',
                    'account_name'   => 'LIM SOCHEATA',
                    'account_number' => '098 771 223',
                    'phone'          => '098 771 223',
                ],
                'restocking_rate'=> 0.05,
                'shipping_fee'   => 0.05,
                'days_ago'       => 3,
                'approved'       => true,
            ],
            [
                'order_index'    => 1,
                'is_sale'        => true,
                'return_number'  => 'RMA-202609-0005',
                'type'           => 'exchange',
                'channel'        => 'pos',
                'fault'          => 'store',
                'reason_code'    => 'wrong_item_sent',
                'reason_notes'   => 'បុគ្គលិកគិតលុយប្រគល់ខុសពណ៌ (Cashier issued Grey instead of Silver Edition)',
                'status'         => 'approved',
                'refund_status'  => 'offset_exchange',
                'refund_method'  => 'original_payment',
                'refund_account' => null,
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 2,
                'approved'       => true,
            ],

            // ─── 3. IN_TRANSIT (កំពុងដឹកជញ្ជូនត្រឡប់មកឃ្លាំង) ───────────────────
            [
                'order_index'    => 3,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0006',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'courier',
                'reason_code'    => 'damaged_in_transit',
                'reason_notes'   => 'ប្រអប់ទំនិញត្រូវបានក្រឡិតបែកជ្រុងពេលដឹកជញ្ជូនតាមឡាន (Package corner crushed during transit)',
                'status'         => 'in_transit',
                'refund_status'  => 'pending',
                'refund_method'  => 'bakong_khqr',
                'refund_account' => [
                    'bank_name'      => 'ABA Bank',
                    'account_name'   => 'HENG PISETH',
                    'account_number' => '002 991 304',
                    'phone'          => '017 889 005',
                ],
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 4,
                'approved'       => true,
                'shipment'       => [
                    'carrier'         => 'Virak Buntham Logistics (VET)',
                    'tracking_number' => 'VET-RMA-9920184',
                    'pickup_type'     => 'courier_dropoff',
                    'shipping_fee'    => 0.10,
                    'paid_by'         => 'store',
                    'status'          => 'in_transit',
                ],
            ],
            [
                'order_index'    => 4,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0007',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'customer',
                'reason_code'    => 'wrong_variant_selected',
                'reason_notes'   => 'អតិថិជនផ្ញើមកវិញតាម J&T Express Cambodia ពីខេត្តសៀមរាប',
                'status'         => 'in_transit',
                'refund_status'  => 'pending',
                'refund_method'  => 'store_credit',
                'refund_account' => null,
                'restocking_rate'=> 0.05,
                'shipping_fee'   => 0.05,
                'days_ago'       => 3,
                'approved'       => true,
                'shipment'       => [
                    'carrier'         => 'J&T Express Cambodia',
                    'tracking_number' => 'JT-KH-77192038',
                    'pickup_type'     => 'courier_dropoff',
                    'shipping_fee'    => 0.05,
                    'paid_by'         => 'customer',
                    'status'          => 'in_transit',
                ],
            ],

            // ─── 4. INSPECTING (កំពុងត្រួតពិនិត្យគុណភាព QC) ─────────────────────
            [
                'order_index'    => 5,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0008',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'store',
                'reason_code'    => 'defective',
                'reason_notes'   => 'ក្តារចុចមិនដំណើរការលើគ្រាប់មួយចំនួន (Keyboard intermittent key failure)',
                'status'         => 'inspecting',
                'refund_status'  => 'pending',
                'refund_method'  => 'bakong_khqr',
                'refund_account' => [
                    'bank_name'      => 'ABA Bank',
                    'account_name'   => 'BUN ROTHA',
                    'account_number' => '001 445 918',
                    'phone'          => '077 889 007',
                ],
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 5,
                'approved'       => true,
                'shipment'       => [
                    'carrier'         => 'GrabExpress Phnom Penh Instant',
                    'tracking_number' => 'GRAB-EXP-889104',
                    'pickup_type'     => 'driver_intercept',
                    'shipping_fee'    => 0.10,
                    'paid_by'         => 'store',
                    'status'          => 'delivered',
                ],
                'inspection'     => [
                    'verdict'       => 'pass',
                    'status'        => 'in_progress',
                    'condition'     => 'open_box',
                    'inventory_act' => 'move_to_refurbished',
                    'notes'         => 'ទំនិញបានទទួលនៅឃ្លាំងកណ្តាល កំពុងតេស្តក្តារចុចជាមួយឧបករណ៍រោគវិនិច្ឆ័យ Hardware Tester',
                ],
            ],
            [
                'order_index'    => 2,
                'is_sale'        => true,
                'return_number'  => 'RMA-202609-0009',
                'type'           => 'return',
                'channel'        => 'pos',
                'fault'          => 'store',
                'reason_code'    => 'wrong_item_sent',
                'reason_notes'   => 'ម៉ូដែលទំនិញខុសកូដ Barcode លើប្រអប់ (Barcode mismatched with physical hardware inside)',
                'status'         => 'inspecting',
                'refund_status'  => 'pending',
                'refund_method'  => 'cash',
                'refund_account' => null,
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 4,
                'approved'       => true,
                'inspection'     => [
                    'verdict'       => 'pass',
                    'status'        => 'in_progress',
                    'condition'     => 'resellable_new',
                    'inventory_act' => 'restock_available',
                    'notes'         => 'ប្រអប់មិនទាន់ហែក បញ្ជាក់ត្រូវគ្នា ១០០% អាចដាក់លក់ឡើងវិញបាន',
                ],
            ],

            // ─── 5. COMPLETED (បានបញ្ចប់ និងសងប្រាក់រួចរាល់) ────────────────────
            [
                'order_index'    => 6,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0010',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'store',
                'reason_code'    => 'defective',
                'reason_notes'   => 'ដុំសាកឡើងកម្តៅខុសប្រក្រតី (Charger adapter overheating) ត្រួតពិនិត្យឃើញខូចពិតប្រាកដ',
                'status'         => 'completed',
                'refund_status'  => 'refunded',
                'refund_method'  => 'bakong_khqr',
                'refund_account' => [
                    'bank_name'      => 'ABA Bank (Bakong KHQR)',
                    'account_name'   => 'TEP BOPHA',
                    'account_number' => '001 559 184',
                    'phone'          => '081 229 008',
                ],
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 7,
                'approved'       => true,
                'completed'      => true,
                'shipment'       => [
                    'carrier'         => 'Virak Buntham Logistics (VET)',
                    'tracking_number' => 'VET-RMA-8819201',
                    'pickup_type'     => 'courier_dropoff',
                    'shipping_fee'    => 0.10,
                    'paid_by'         => 'store',
                    'status'          => 'delivered',
                ],
                'inspection'     => [
                    'verdict'       => 'pass',
                    'status'        => 'completed',
                    'condition'     => 'scrap',
                    'inventory_act' => 'scrap_write_off',
                    'notes'         => 'ផ្ទៀងផ្ទាត់បញ្ហាបច្ចេកទេសរួចរាល់ បានសរសេរស្នើប្តូរទៅកាន់ក្រុមហ៊ុនផលិតផលដើម',
                ],
            ],
            [
                'order_index'    => 7,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0011',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'customer',
                'reason_code'    => 'changed_mind',
                'reason_notes'   => 'បង្វិលសងប្រាក់ចូល Store Credit Wallet របស់អតិថិជនដោយស្វ័យប្រវត្តិ',
                'status'         => 'completed',
                'refund_status'  => 'store_credit',
                'refund_method'  => 'store_credit',
                'refund_account' => null,
                'restocking_rate'=> 0.05,
                'shipping_fee'   => 0.05,
                'days_ago'       => 6,
                'approved'       => true,
                'completed'      => true,
                'inspection'     => [
                    'verdict'       => 'pass',
                    'status'        => 'completed',
                    'condition'     => 'resellable_new',
                    'inventory_act' => 'restock_available',
                    'notes'         => 'ទំនិញស្ថិតក្នុងសភាពថ្មី ១០០% បានបញ្ចូលស្តុកឡើងវិញរួចរាល់',
                ],
            ],
            [
                'order_index'    => 8,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0012',
                'type'           => 'exchange',
                'channel'        => 'web',
                'fault'          => 'customer',
                'reason_code'    => 'wrong_variant_selected',
                'reason_notes'   => 'ប្តូរយកម៉ូដែលទំហំធំជាងមុន អតិថិជនបានបង់ថ្លៃខុសគ្នាបន្ថែម (Exchanged for higher tier model)',
                'status'         => 'completed',
                'refund_status'  => 'offset_exchange',
                'refund_method'  => 'bakong_khqr',
                'refund_account' => null,
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 8,
                'approved'       => true,
                'completed'      => true,
                'exchange'       => [
                    'old_items_credit'     => 0.69,
                    'new_items_cost'       => 0.78,
                    'price_difference'     => 0.09,
                    'exchange_fee'         => 0.00,
                    'shipping_difference'  => 0.00,
                    'customer_balance_due' => 0.09,
                    'store_refund_due'     => 0.00,
                    'payment_status'       => 'paid',
                    'notes'                => 'បានទូទាត់ទឹកប្រាក់បន្ថែមចំនួន $0.09 តាម Bakong KHQR រួចរាល់',
                ],
            ],

            // ─── 6. REJECTED (បានបដិសេធ) ───────────────────────────────────────
            [
                'order_index'    => 9,
                'is_sale'        => false,
                'return_number'  => 'RMA-202609-0013',
                'type'           => 'return',
                'channel'        => 'web',
                'fault'          => 'customer',
                'reason_code'    => 'defective',
                'reason_notes'   => 'ទំនិញធ្លាក់ទឹក ស្លាក Liquid Contact Indicator ប្តូរពណ៌ក្រហម (Liquid damage voiding warranty)',
                'status'         => 'rejected',
                'refund_status'  => 'pending',
                'refund_method'  => 'original_payment',
                'refund_account' => null,
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 5,
                'approved'       => false,
                'admin_notes'    => 'បដិសេធសំណើដោយសារទំនិញធ្លាក់ចូលទឹក ហួសលក្ខខណ្ឌធានា និងខុសគោលការណ៍បង្វិលសង។',
            ],
            [
                'order_index'    => 3,
                'is_sale'        => true,
                'return_number'  => 'RMA-202609-0014',
                'type'           => 'return',
                'channel'        => 'pos',
                'fault'          => 'customer',
                'reason_code'    => 'changed_mind',
                'reason_notes'   => 'ស្នើសុំបង្វិលសងក្រោយរយៈពេល ១៨ ថ្ងៃ ហួសកាលកំណត់គោលការណ៍ ៧ ថ្ងៃ (Exceeded 7-day return window)',
                'status'         => 'rejected',
                'refund_status'  => 'pending',
                'refund_method'  => 'cash',
                'refund_account' => null,
                'restocking_rate'=> 0.00,
                'shipping_fee'   => 0.00,
                'days_ago'       => 9,
                'approved'       => false,
                'admin_notes'    => 'ហួសកាលកំណត់បង្វិលសងទំនិញរបស់ហាង (Exceeded 7 days limit).',
            ],
        ];

        $createdCount = 0;

        foreach ($rmaDefinitions as $def) {
            $order = null;
            $sale = null;
            $customer = null;
            $selectedItem = null;

            if ($def['is_sale']) {
                $sale = $sales->get($def['order_index']) ?? $sales->first();
                if (!$sale || $sale->items->isEmpty()) continue;
                $customer = $sale->customer;
                $selectedItem = $sale->items->first();
            } else {
                $order = $orders->get($def['order_index']) ?? $orders->first();
                if (!$order || $order->items->isEmpty()) continue;
                $customer = $order->customer;
                $selectedItem = $order->items->first();
            }

            if (!$selectedItem) continue;

            $product = $selectedItem->product ?? Product::find($selectedItem->product_id);
            if (!$product) continue;

            // Calculate amounts realistic to the items
            $itemQty = 1.0;
            // Use authentic unit price from order item or product catalog (all strictly under $1.00)
            $unitPrice = (float)($selectedItem->unit_price ?? $product->selling_price ?? 0.85);

            $subtotal = round($unitPrice * $itemQty, 2);
            $allocatedDiscount = 0.00;
            $taxAmount = round($subtotal * 0.10, 2);
            $restockingFee = round($subtotal * $def['restocking_rate'], 2);
            $shippingFee = (float)$def['shipping_fee'];
            $netRefund = round($subtotal + $taxAmount - $restockingFee - $shippingFee, 2);
            if ($netRefund < 0) $netRefund = 0;

            $createdAt = now()->subDays($def['days_ago'])->subHours(rand(1, 10));
            $approvedAt = !empty($def['approved']) ? (clone $createdAt)->addHours(2) : null;
            $completedAt = !empty($def['completed']) ? (clone $createdAt)->addHours(28) : null;

            $orderReturn = OrderReturn::create([
                'company_id'                => $company->id,
                'order_id'                  => $order?->id,
                'sale_id'                   => $sale?->id,
                'customer_id'               => $customer?->id,
                'warehouse_id'              => $warehouse?->id ?? 1,
                'return_number'             => $def['return_number'],
                'type'                      => $def['type'],
                'channel'                   => $def['channel'],
                'fault'                     => $def['fault'],
                'reason_code'               => $def['reason_code'],
                'reason_notes'              => $def['reason_notes'],
                'status'                    => $def['status'],
                'currency_code'             => 'USD',
                'exchange_rate'             => 1.000000,
                'subtotal_amount'           => $subtotal,
                'allocated_discount_amount' => $allocatedDiscount,
                'tax_amount'                => $taxAmount,
                'restocking_fee'            => $restockingFee,
                'return_shipping_fee'       => $shippingFee,
                'total_refund_amount'       => $netRefund,
                'refund_status'             => $def['refund_status'],
                'refund_method'             => $def['refund_method'],
                'refund_account_info'       => $def['refund_account'],
                'expires_at'                => (clone $createdAt)->addDays(14),
                'approved_by'               => $approvedAt ? $inspector?->id : null,
                'approved_at'               => $approvedAt,
                'completed_at'              => $completedAt,
                'admin_notes'               => $def['admin_notes'] ?? null,
                'created_at'                => $createdAt,
                'updated_at'                => $completedAt ?? $approvedAt ?? $createdAt,
            ]);

            // Create Return Item
            $returnItem = OrderReturnItem::create([
                'order_return_id'        => $orderReturn->id,
                'order_item_id'          => $order ? $selectedItem->id : null,
                'sale_item_id'           => $sale ? $selectedItem->id : null,
                'product_id'             => $product->id,
                'product_variant_id'     => $selectedItem->product_variant_id ?? null,
                'quantity_requested'     => $itemQty,
                'quantity_received'      => in_array($def['status'], ['received', 'inspecting', 'completed']) ? $itemQty : 0,
                'unit_price'             => $unitPrice,
                'allocated_discount'     => $allocatedDiscount,
                'allocated_tax'          => $taxAmount,
                'net_unit_refund'        => $netRefund,
                'total_refund'           => $netRefund,
                'sold_serial_number'     => 'SN-' . strtoupper(substr(md5($product->sku . $selectedItem->id), 0, 10)),
                'returned_serial_number' => 'SN-' . strtoupper(substr(md5($product->sku . $selectedItem->id), 0, 10)),
                'condition_grade'        => $def['inspection']['condition'] ?? ($def['status'] === 'completed' ? 'resellable_new' : null),
                'inspection_status'      => in_array($def['status'], ['completed']) ? 'passed' : ($def['status'] === 'inspecting' ? 'pending' : 'pending'),
                'notes'                  => $def['reason_notes'],
                'created_at'             => $createdAt,
                'updated_at'             => $createdAt,
            ]);

            // Create Return Shipment if applicable
            if (!empty($def['shipment'])) {
                ReturnShipment::create([
                    'order_return_id'    => $orderReturn->id,
                    'shipping_method_id' => str_contains($def['shipment']['carrier'], 'Virak') ? $vetMethod?->id : $jntMethod?->id,
                    'carrier'            => $def['shipment']['carrier'],
                    'tracking_number'    => $def['shipment']['tracking_number'],
                    'pickup_type'        => $def['shipment']['pickup_type'],
                    'shipping_fee'       => $def['shipment']['shipping_fee'],
                    'paid_by'            => $def['shipment']['paid_by'],
                    'status'             => $def['shipment']['status'],
                    'shipped_at'         => (clone $createdAt)->addHours(6),
                    'delivered_at'       => $def['shipment']['status'] === 'delivered' ? (clone $createdAt)->addHours(20) : null,
                    'notes'              => 'Reverse logistics package tracking initiated.',
                    'created_at'         => (clone $createdAt)->addHours(6),
                    'updated_at'         => (clone $createdAt)->addHours(20),
                ]);
            }

            // Create Return Inspection if applicable
            if (!empty($def['inspection'])) {
                $inspection = ReturnInspection::create([
                    'order_return_id'   => $orderReturn->id,
                    'warehouse_id'      => $warehouse?->id ?? 1,
                    'inspector_id'      => $inspector?->id ?? 1,
                    'inspection_number' => 'QC-' . date('Ym') . '-' . str_pad($orderReturn->id, 4, '0', STR_PAD_LEFT),
                    'status'            => $def['inspection']['status'],
                    'verdict'           => $def['inspection']['verdict'],
                    'summary_notes'     => $def['inspection']['notes'],
                    'images'            => ['returns/inspection_01.webp', 'returns/inspection_02.webp'],
                    'inspected_at'      => (clone $createdAt)->addHours(22),
                    'created_at'        => (clone $createdAt)->addHours(22),
                    'updated_at'        => (clone $createdAt)->addHours(22),
                ]);

                ReturnInspectionItem::create([
                    'return_inspection_id' => $inspection->id,
                    'order_return_item_id' => $returnItem->id,
                    'serial_matched'       => true,
                    'accessories_checklist'=> ['box' => true, 'charger' => true, 'cable' => true, 'manual' => true],
                    'condition_grade'      => $def['inspection']['condition'],
                    'deduction_amount'     => 0.00,
                    'inventory_action'     => $def['inspection']['inventory_act'],
                    'inspector_notes'      => $def['inspection']['notes'],
                    'photos'               => ['returns/qc_serial.webp'],
                ]);
            }

            // Create Exchange Order if applicable
            if (!empty($def['exchange'])) {
                ExchangeOrder::create([
                    'order_return_id'      => $orderReturn->id,
                    'replacement_order_id' => null,
                    'replacement_sale_id'  => null,
                    'old_items_credit'     => $def['exchange']['old_items_credit'],
                    'new_items_cost'       => $def['exchange']['new_items_cost'],
                    'price_difference'     => $def['exchange']['price_difference'],
                    'exchange_fee'         => $def['exchange']['exchange_fee'],
                    'shipping_difference'  => $def['exchange']['shipping_difference'],
                    'customer_balance_due' => $def['exchange']['customer_balance_due'],
                    'store_refund_due'     => $def['exchange']['store_refund_due'],
                    'payment_status'       => $def['exchange']['payment_status'],
                    'notes'                => $def['exchange']['notes'],
                ]);
            }

            $createdCount++;
        }

        $this->command->info("Successfully seeded {$createdCount} RMA (Order Return) records with complete items, reverse logistics, and QC inspection data!");
    }
}
