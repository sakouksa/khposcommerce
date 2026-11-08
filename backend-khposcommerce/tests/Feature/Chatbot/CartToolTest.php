<?php

namespace Tests\Feature\Chatbot;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Product\Product;
use App\Services\Chatbot\Tools\CartTool;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CartToolTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private Product $product;
    private CartTool $tool;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'      => 'Cart Corp',
            'slug'      => 'cart-corp',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'company_id'      => $this->company->id,
            'name'            => 'Wireless Mechanical Keyboard',
            'slug'            => 'wireless-mechanical-keyboard',
            'sku'             => 'KEY-MECH-01',
            'selling_price'   => 129.99,
            'cost_price'      => 80.00,
            'status'          => 'active',
            'track_inventory' => false,
            'is_active'       => true,
        ]);

        $this->tool = new CartTool();
    }

    public function test_can_add_item_to_guest_cart_via_tool(): void
    {
        $context = [
            'session_token' => 'guest_cart_tool_test_999',
        ];

        $res = $this->tool->addToCart([
            'product_identifier' => 'KEY-MECH-01',
            'quantity'           => 2,
        ], $context);

        $this->assertTrue($res['success']);
        $this->assertEquals(2, $res['cart']['item_count']);
        $this->assertEquals(259.98, $res['cart']['subtotal']);

        $viewRes = $this->tool->getCart([], $context);
        $this->assertEquals(1, count($viewRes['cart']['items']));
    }

    public function test_can_clear_cart_via_tool(): void
    {
        $context = [
            'session_token' => 'guest_clear_cart_test_111',
        ];

        $this->tool->addToCart([
            'product_identifier' => 'KEY-MECH-01',
            'quantity'           => 1,
        ], $context);

        $clearRes = $this->tool->clearCart([], $context);
        $this->assertTrue($clearRes['success']);

        $viewRes = $this->tool->getCart([], $context);
        $this->assertEquals(0, $viewRes['cart']['item_count']);
    }
}
