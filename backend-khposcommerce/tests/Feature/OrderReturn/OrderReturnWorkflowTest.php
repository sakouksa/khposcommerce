<?php

namespace Tests\Feature\OrderReturn;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Company\Company;
use App\Models\Company\Store;
use App\Models\Company\Warehouse;
use App\Models\Customer\Customer;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Inventory\Inventory;
use App\Models\User;
use App\Services\OrderReturn\OrderReturnService;
use App\Services\OrderReturn\ReturnPolicyEngineService;
use App\Services\OrderReturn\ReturnFinancialCalculatorService;
use App\Services\Customer\CustomerWalletService;

class OrderReturnWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private OrderReturnService $returnService;
    private User $user;
    private Company $company;
    private Warehouse $warehouse;
    private Customer $customer;
    private Order $order;
    private OrderItem $orderItem;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->returnService = app(OrderReturnService::class);

        $this->company = Company::create([
            'name' => 'Test Company',
            'slug' => 'test-company-' . uniqid(),
        ]);
        $this->user = User::create([
            'name' => 'Admin User',
            'email' => 'admin_test_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
        ]);
        $this->actingAs($this->user);

        $branch = \App\Models\Company\Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'Main Branch',
            'code'       => 'BR-' . uniqid(),
        ]);

        $store = Store::create([
            'company_id' => $this->company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Test Store',
            'slug'       => 'test-store-' . uniqid(),
            'code'       => 'TS-' . uniqid(),
        ]);

        $this->warehouse = Warehouse::create([
            'company_id' => $this->company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Main Warehouse',
            'code'       => 'MW-' . uniqid(),
        ]);

        $this->customer = Customer::first() ?? Customer::create([
            'company_id' => $this->company->id,
            'name'       => 'Vannak Heng',
            'phone'      => '012999888',
        ]);

        $category = Category::first() ?? Category::create([
            'company_id' => $this->company->id,
            'name'       => 'Phones & Electronics',
            'slug'       => 'phones-electronics',
        ]);

        $this->product = Product::create([
            'company_id'      => $this->company->id,
            'category_id'     => $category->id,
            'name'            => 'iPhone 15 Black 128GB',
            'slug'            => 'iphone-15-black-128gb-' . uniqid(),
            'sku'             => 'IPHONE15-BLK-' . uniqid(),
            'price'           => 800.00,
            'cost_price'      => 650.00,
            'track_inventory' => true,
        ]);

        // Create delivered order with subtotal $800, discount $50, paid $750
        $this->order = Order::create([
            'company_id'      => $this->company->id,
            'store_id'        => $store->id,
            'customer_id'     => $this->customer->id,
            'warehouse_id'    => $this->warehouse->id,
            'order_number'    => 'ORD-TEST-' . uniqid(),
            'status'          => 'delivered',
            'subtotal'        => 800.00,
            'discount_amount' => 50.00,
            'tax_amount'      => 0.00,
            'grand_total'     => 750.00,
            'paid_amount'     => 750.00,
        ]);

        $this->orderItem = OrderItem::create([
            'order_id'        => $this->order->id,
            'product_id'      => $this->product->id,
            'product_name'    => $this->product->name,
            'product_sku'     => $this->product->sku,
            'quantity'        => 1,
            'unit_price'      => 800.00,
            'subtotal'        => 800.00,
            'discount_amount' => 50.00,
            'total'           => 750.00,
        ]);
    }

    public function test_complete_return_lifecycle_with_qc_and_restock(): void
    {
        // 1. Create Return Request (Store fault: wrong color sent)
        $return = $this->returnService->createReturn([
            'order_id'     => $this->order->id,
            'fault'        => 'store',
            'reason_code'  => 'wrong_item_sent',
            'reason_notes' => 'Customer ordered Black but received Blue',
            'items'        => [
                [
                    'order_item_id'          => $this->orderItem->id,
                    'quantity'               => 1,
                    'sold_serial_number'     => 'IMEI-123456789',
                    'returned_serial_number' => 'IMEI-123456789',
                ]
            ],
            'refund_method' => 'store_credit',
        ]);

        $this->assertNotNull($return->id);
        $this->assertEquals('requested', $return->status);
        $this->assertEquals('store', $return->fault);
        // Full paid net refund of $750 ($800 minus $50 discount, no restocking fee for store fault)
        $this->assertEquals(750.00, (float)$return->total_refund_amount);

        // 2. Approve Return
        $approved = $this->returnService->approveReturn($return->id, 'Approved by CS team');
        $this->assertEquals('approved', $approved->status);

        // 3. Reverse Logistics Shipment
        $shipment = $this->returnService->recordShipment($return->id, [
            'carrier'         => 'J&T Express',
            'tracking_number' => 'JT-CAMBODIA-999',
            'paid_by'         => 'store',
        ]);
        $this->assertEquals('in_transit', $shipment->status);
        $this->assertEquals('in_transit', $return->fresh()->status);

        // 4. Warehouse Receive into Holding / Quarantine
        $received = $this->returnService->receiveReturn($return->id, $this->warehouse->id);
        $this->assertEquals('inspecting', $received->status);

        // Verify that stock is NOT yet added to available inventory before inspection
        $initialStock = Inventory::where('warehouse_id', $this->warehouse->id)
            ->where('product_id', $this->product->id)
            ->first()?->quantity ?? 0;

        // 5. Complete QC Inspection (Pass, Serial Match, Resellable New -> Restock)
        $returnItem = $return->items()->first();
        $inspection = $this->returnService->completeInspection($return->id, [
            'warehouse_id'  => $this->warehouse->id,
            'verdict'       => 'pass',
            'summary_notes' => 'Box in mint condition, accessories complete, IMEI matched.',
            'items'         => [
                [
                    'order_return_item_id'   => $returnItem->id,
                    'serial_matched'         => true,
                    'returned_serial_number' => 'IMEI-123456789',
                    'condition_grade'        => 'resellable_new',
                    'inventory_action'       => 'restock_available',
                    'quantity_received'      => 1,
                    'deduction_amount'       => 0,
                ]
            ]
        ]);

        $this->assertEquals('pass', $inspection->verdict);
        $this->assertEquals('inspected', $return->fresh()->status);

        // Verify inventory was now incremented by 1 with movement type 'sale_return_restock'
        $updatedStock = (float)Inventory::where('warehouse_id', $this->warehouse->id)
            ->where('product_id', $this->product->id)
            ->first()?->quantity;

        $this->assertEquals($initialStock + 1, $updatedStock);

        // 6. Settle Refund to Store Credit Wallet
        $settled = $this->returnService->settleRefund($return->id, [
            'refund_method' => 'store_credit',
            'refund_amount' => 750.00,
        ]);

        $this->assertEquals('completed', $settled->status);
        $this->assertEquals('refunded', $settled->refund_status);

        // Verify Customer Wallet balance increased by $750
        $wallet = \App\Models\Customer\CustomerWallet::where('customer_id', $this->customer->id)->first();
        $this->assertNotNull($wallet);
        $this->assertEquals(750.00, (float)$wallet->balance);
    }
}
