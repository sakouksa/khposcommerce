<?php

namespace Tests\Feature\Chatbot;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use App\Models\Customer\Customer;
use App\Models\Order\Order;
use App\Services\Chatbot\Tools\OrderTool;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderToolTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private Branch $branch;
    private Store $store;
    private Customer $customerA;
    private Customer $customerB;
    private Order $orderA;
    private Order $orderB;
    private OrderTool $tool;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'      => 'Order Corp',
            'slug'      => 'order-corp',
            'is_active' => true,
        ]);

        $this->branch = Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'Main Branch',
            'code'       => 'BR-ORD',
            'is_active'  => true,
        ]);

        $this->store = Store::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branch->id,
            'name'       => 'Order Flagship Store',
            'code'       => 'STORE-ORD',
            'slug'       => 'order-flagship-store',
            'is_active'  => true,
        ]);

        $this->customerA = Customer::create([
            'company_id' => $this->company->id,
            'name'       => 'Alice Smith',
            'email'      => 'alice@example.com',
            'phone'      => '012345678',
            'is_active'  => true,
        ]);

        $this->customerB = Customer::create([
            'company_id' => $this->company->id,
            'name'       => 'Bob Jones',
            'email'      => 'bob@example.com',
            'phone'      => '087654321',
            'is_active'  => true,
        ]);

        $this->orderA = Order::create([
            'company_id'     => $this->company->id,
            'store_id'       => $this->store->id,
            'customer_id'    => $this->customerA->id,
            'order_number'   => 'ORD-ALICE-101',
            'status'         => 'processing',
            'payment_status' => 'paid',
            'grand_total'    => 150.00,
            'subtotal'       => 140.00,
            'tax_amount'     => 10.00,
        ]);

        $this->orderB = Order::create([
            'company_id'     => $this->company->id,
            'store_id'       => $this->store->id,
            'customer_id'    => $this->customerB->id,
            'order_number'   => 'ORD-BOB-202',
            'status'         => 'delivered',
            'payment_status' => 'paid',
            'grand_total'    => 320.00,
            'subtotal'       => 300.00,
            'tax_amount'     => 20.00,
        ]);

        $this->tool = new OrderTool();
    }

    public function test_customer_can_retrieve_own_order_history(): void
    {
        $res = $this->tool->getOrderHistory([], [
            'customer_id' => $this->customerA->id,
        ]);

        $this->assertTrue($res['found']);
        $this->assertCount(1, $res['orders']);
        $this->assertEquals('ORD-ALICE-101', $res['orders'][0]['order_number']);
    }

    public function test_customer_cannot_view_another_customer_order_by_order_number(): void
    {
        // Alice attempts to lookup Bob's order
        $res = $this->tool->getOrderStatus([
            'order_number' => 'ORD-BOB-202',
        ], [
            'customer_id' => $this->customerA->id,
        ]);

        $this->assertFalse($res['found']);
        $this->assertStringContainsString('not found or does not belong', $res['message']);
    }

    public function test_guest_cannot_view_order_history_without_authentication(): void
    {
        $res = $this->tool->getOrderHistory([], [
            'customer_id' => null,
        ]);

        $this->assertFalse($res['found']);
        $this->assertStringContainsString('Please log in', $res['message']);
    }
}
