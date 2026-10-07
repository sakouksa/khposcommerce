<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Warehouse;
use App\Models\Product\Product;
use App\Models\Product\Unit;
use App\Models\Customer\Customer;
use App\Models\Marketing\Coupon;
use App\Services\Order\Actions\CheckoutAction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerCheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_execute_customer_checkout_with_coupon_and_create_order(): void
    {
        $company = Company::create([
            'name'  => 'E-Commerce Enterprise Ltd',
            'code'  => 'ECL',
            'slug'  => 'ecommerce-enterprise-ltd',
            'email' => 'store@enterprise.com',
        ]);

        $branch = Branch::create([
            'company_id' => $company->id,
            'name'       => 'Store Branch',
            'code'       => 'SB01',
        ]);

        $warehouse = Warehouse::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Ecom Fulfillment Center',
            'code'       => 'WH03',
        ]);

        $unit = Unit::create([
            'company_id' => $company->id,
            'name'       => 'Unit',
            'symbol'     => 'unit',
        ]);

        $product = Product::create([
            'company_id'     => $company->id,
            'unit_id'        => $unit->id,
            'name'           => 'Wireless Noise Cancelling Headphones',
            'slug'           => 'wireless-noise-cancelling-headphones',
            'sku'            => 'WNC-500',
            'selling_price'  => 100.00,
            'stock_quantity' => 50,
            'is_active'      => true,
        ]);

        $customer = Customer::create([
            'company_id' => $company->id,
            'name'       => 'Online Shopper',
            'email'      => 'shopper@test.com',
            'phone'      => '012345678',
            'is_active'  => true,
        ]);

        $coupon = Coupon::create([
            'company_id'   => $company->id,
            'code'         => 'SAVE10',
            'name'         => '10% Discount',
            'type'         => 'percentage',
            'value'        => 10,
            'min_purchase' => 50,
            'is_active'    => true,
        ]);

        $store = \App\Models\Company\Store::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Online Store',
            'slug'       => 'online-store',
            'code'       => 'OS01',
        ]);

        $action = app(CheckoutAction::class);
        $order = $action->execute([
            'company_id'        => $company->id,
            'store_id'          => $store->id,
            'warehouse_id'      => $warehouse->id,
            'customer_id'       => $customer->id,
            'shipping_name'     => 'Online Shopper',
            'shipping_phone'    => '012345678',
            'shipping_address'  => 'Street 2004, Phnom Penh',
            'shipping_city'     => 'Phnom Penh',
            'shipping_province' => 'Phnom Penh',
            'shipping_country'  => 'Cambodia',
            'shipping_cost'     => 2.00,
            'coupon_code'       => 'SAVE10',
            'items'             => [
                [
                    'product_id' => $product->id,
                    'quantity'   => 2,
                    'unit_price' => 100.00,
                ],
            ],
        ], customerId: $customer->id);

        $this->assertNotNull($order);
        // Subtotal = 200. Discount 10% = 20. Shipping = 2. Total = 182.
        $this->assertEquals(200.00, (float) $order->subtotal);
        $this->assertEquals(20.00, (float) $order->discount_amount);
        $this->assertEquals(2.00, (float) $order->shipping_cost);
        $this->assertEquals(182.00, (float) $order->grand_total);
        $this->assertEquals('pending', $order->status);

        // Verify order items saved
        $this->assertDatabaseHas('order_items', [
            'order_id'   => $order->id,
            'product_id' => $product->id,
            'quantity'   => 2,
            'unit_price' => 100.00,
        ]);
    }
}
