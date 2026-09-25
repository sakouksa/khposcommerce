<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerStoreApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_access_health_check_endpoint(): void
    {
        $response = $this->getJson('/api/v1/health');
        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'timestamp']);
    }

    public function test_can_access_public_branding_endpoint(): void
    {
        $response = $this->getJson('/api/v1/public/branding');
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_can_access_storefront_homepage_via_standard_customer_route(): void
    {
        $response = $this->getJson('/api/v1/customer/homepage');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'hero_banners',
                    'quick_categories',
                    'featured_products',
                ],
            ]);
    }

    public function test_can_access_storefront_homepage_via_backward_compatible_store_route(): void
    {
        $response = $this->getJson('/api/v1/store/homepage');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'banners',
                    'top_categories',
                    'featured_products',
                ],
            ]);
    }

    public function test_can_access_catalog_endpoints(): void
    {
        $catResponse = $this->getJson('/api/v1/customer/categories');
        $catResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        $brandsResponse = $this->getJson('/api/v1/customer/brands');
        $brandsResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        $productsResponse = $this->getJson('/api/v1/customer/products');
        $productsResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_can_access_search_endpoints(): void
    {
        $searchResponse = $this->getJson('/api/v1/customer/search?q=laptop');
        $searchResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        $autoResponse = $this->getJson('/api/v1/customer/search/autocomplete?q=mac');
        $autoResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        $trendResponse = $this->getJson('/api/v1/customer/trending-searches');
        $trendResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_can_access_content_endpoints(): void
    {
        $blogResponse = $this->getJson('/api/v1/customer/blog');
        $blogResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        $faqsResponse = $this->getJson('/api/v1/customer/faqs');
        $faqsResponse->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_can_interact_with_cart_endpoints(): void
    {
        // 1. Empty cart
        $cartResponse = $this->getJson('/api/v1/customer/cart', ['X-Session-ID' => 'test-session-123']);
        $cartResponse->assertStatus(200)
            ->assertJsonPath('data.item_count', 0);

        // 2. Create company, store, unit & product and add to cart
        $company = \App\Models\Company\Company::create([
            'name' => 'Store Test Corp',
            'code' => 'STC',
            'slug' => 'store-test-corp',
        ]);
        $branch = \App\Models\Company\Branch::create([
            'company_id' => $company->id,
            'name'       => 'Main Branch',
            'code'       => 'MB-01',
        ]);
        $store = \App\Models\Company\Store::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Main Store',
            'slug'       => 'main-store',
        ]);
        $unit = \App\Models\Product\Unit::create(['company_id' => $company->id, 'name' => 'Piece', 'symbol' => 'pcs']);
        $product = \App\Models\Product\Product::create([
            'company_id'     => $company->id,
            'name'           => 'Wireless Headphones',
            'slug'           => 'wireless-headphones',
            'sku'            => 'WH-001',
            'selling_price'  => 89.99,
            'stock_quantity' => 50,
            'unit_id'        => $unit->id,
            'is_active'      => true,
            'track_inventory' => false,
        ]);

        $addResponse = $this->postJson('/api/v1/customer/cart/add', [
            'product_id' => $product->id,
            'quantity'   => 2,
        ], ['X-Session-ID' => 'test-session-123']);

        $addResponse->assertStatus(200)
            ->assertJsonPath('data.item_count', 1);

        // 3. Clear cart
        $clearResponse = $this->deleteJson('/api/v1/customer/cart/clear', [], ['X-Session-ID' => 'test-session-123']);
        $clearResponse->assertStatus(200)
            ->assertJsonPath('data.item_count', 0);
    }
}
