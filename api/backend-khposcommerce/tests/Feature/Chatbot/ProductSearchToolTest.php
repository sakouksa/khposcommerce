<?php

namespace Tests\Feature\Chatbot;

use Tests\TestCase;
use App\Models\Company\Company;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Services\Chatbot\Tools\ProductTool;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductSearchToolTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private ProductTool $tool;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'      => 'Tech Corp',
            'slug'      => 'tech-corp',
            'is_active' => true,
        ]);

        $this->tool = new ProductTool();

        $cat = Category::create([
            'company_id' => $this->company->id,
            'name'       => 'Smartphones',
            'slug'       => 'smartphones',
            'is_active'  => true,
        ]);

        $brand = Brand::create([
            'company_id' => $this->company->id,
            'name'       => 'Apple',
            'slug'       => 'apple',
            'is_active'  => true,
        ]);

        Product::create([
            'company_id'      => $this->company->id,
            'category_id'     => $cat->id,
            'brand_id'        => $brand->id,
            'name'            => 'iPhone 16 Pro Max 256GB',
            'slug'            => 'iphone-16-pro-max-256gb',
            'sku'             => 'IPH-16-PRO-MAX',
            'selling_price'   => 1199.00,
            'cost_price'      => 900.00,
            'status'          => 'active',
            'track_inventory' => false,
            'is_active'       => true,
        ]);

        Product::create([
            'company_id'      => $this->company->id,
            'category_id'     => $cat->id,
            'brand_id'        => $brand->id,
            'name'            => 'iPhone 15 Pro 128GB',
            'slug'            => 'iphone-15-pro-128gb',
            'sku'             => 'IPH-15-PRO',
            'selling_price'   => 999.00,
            'cost_price'      => 750.00,
            'status'          => 'active',
            'track_inventory' => false,
            'is_active'       => true,
        ]);
    }

    public function test_can_search_products_by_keyword(): void
    {
        $result = $this->tool->searchProducts([
            'query' => 'iPhone 16',
        ]);

        $this->assertNotEmpty($result['products']);
        $this->assertEquals('iPhone 16 Pro Max 256GB', $result['products'][0]['name']);
        $this->assertEquals(1199.00, $result['products'][0]['price']);
    }

    public function test_can_filter_products_by_max_price(): void
    {
        $result = $this->tool->searchProducts([
            'max_price' => 1000.00,
        ]);

        $this->assertCount(1, $result['products']);
        $this->assertEquals('iPhone 15 Pro 128GB', $result['products'][0]['name']);
    }

    public function test_can_get_product_details_and_stock(): void
    {
        $result = $this->tool->getProductDetails([
            'identifier' => 'IPH-16-PRO-MAX',
        ]);

        $this->assertNotNull($result['product']);
        $this->assertEquals('iPhone 16 Pro Max 256GB', $result['product']['name']);

        $stockRes = $this->tool->checkProductStock([
            'identifier' => 'IPH-16-PRO-MAX',
        ]);

        $this->assertTrue($stockRes['found']);
        $this->assertArrayHasKey('stock_status', $stockRes);
    }
}
