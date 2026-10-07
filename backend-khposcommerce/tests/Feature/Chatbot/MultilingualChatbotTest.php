<?php

namespace Tests\Feature\Chatbot;

use Tests\TestCase;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MultilingualChatbotTest extends TestCase
{
    use RefreshDatabase;

    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::create([
            'name'      => 'Khmer Tech Store',
            'slug'      => 'khmer-tech',
            'is_active' => true,
        ]);

        $branch = Branch::create([
            'company_id' => $company->id,
            'name'       => 'Phnom Penh Branch',
            'code'       => 'PP01',
            'is_active'  => true,
        ]);

        $this->store = Store::create([
            'company_id' => $company->id,
            'branch_id'  => $branch->id,
            'name'       => 'Main Store',
            'code'       => 'STR01',
            'slug'       => 'main-store',
            'is_active'  => true,
        ]);

        $category = Category::create([
            'company_id' => $company->id,
            'name'       => 'Laptops',
            'slug'       => 'laptops',
            'is_active'  => true,
        ]);

        Product::create([
            'company_id'      => $company->id,
            'category_id'     => $category->id,
            'name'            => 'MSI Cyborg 15 Gaming Laptop',
            'slug'            => 'msi-cyborg-15',
            'sku'             => 'MSI-CYBORG-15',
            'cost_price'      => 800,
            'selling_price'   => 999.00,
            'compare_price'   => 1199.00,
            'stock'           => 10,
            'track_inventory' => true,
            'status'          => 'active',
            'is_featured'     => true,
        ]);
    }

    public function test_khmer_query_returns_khmer_response_and_finds_deals(): void
    {
        $response = $this->postJson('/api/v1/customer/chat/message', [
            'message'  => 'សូមបង្ហាញការបញ្ចុះតម្លៃ និងការផ្តល់ជូនពិសេស',
            'language' => 'km',
        ], [
            'X-Session-ID' => 'sess_khmer_test_01',
        ]);

        $response->assertStatus(200);
        $content = $response->json('data.content');

        // Verify that the response is in Khmer (contains Khmer characters)
        $this->assertMatchesRegularExpression('/[\x{1780}-\x{17FF}]/u', $content);
        $this->assertStringContainsString('ប្រូម៉ូសិនពិសេស', $content);

        // Verify products are returned in metadata
        $this->assertNotEmpty($response->json('data.metadata.products'));
    }

    public function test_khmer_laptop_search_finds_english_laptops(): void
    {
        $response = $this->postJson('/api/v1/customer/chat/message', [
            'message'  => 'ខ្ញុំចង់ទិញកុំព្យូទ័រលេងហ្គេម',
            'language' => 'km',
        ], [
            'X-Session-ID' => 'sess_khmer_test_02',
        ]);

        $response->assertStatus(200);
        $content = $response->json('data.content');

        $this->assertMatchesRegularExpression('/[\x{1780}-\x{17FF}]/u', $content);
        $this->assertNotEmpty($response->json('data.metadata.products'));
        $this->assertEquals('MSI Cyborg 15 Gaming Laptop', $response->json('data.metadata.products.0.name'));
    }

    public function test_english_query_returns_english_response(): void
    {
        $response = $this->postJson('/api/v1/customer/chat/message', [
            'message'  => 'Show me current special offers and discounts',
            'language' => 'en',
        ], [
            'X-Session-ID' => 'sess_en_test_01',
        ]);

        $response->assertStatus(200);
        $content = $response->json('data.content');

        $this->assertStringContainsString('promotional', $content);
        $this->assertNotEmpty($response->json('data.metadata.products'));
    }

    public function test_customer_support_query_creates_ticket_and_returns_contacts(): void
    {
        $response = $this->postJson('/api/v1/customer/chat/message', [
            'message'  => 'I would like to talk to customer support',
            'language' => 'en',
        ], [
            'X-Session-ID' => 'sess_support_test_01',
        ]);

        $response->assertStatus(200);
        $content = $response->json('data.content');

        $this->assertStringContainsString('Support Ticket', $content);
        $this->assertStringContainsString('+855 71 888 999', $content);
        $this->assertNotEmpty($response->json('data.metadata.ticket'));
        $this->assertEmpty($response->json('data.metadata.products'));
    }

    public function test_typo_customer_soport_returns_support_instead_of_random_products(): void
    {
        $response = $this->postJson('/api/v1/customer/chat/message', [
            'message'  => 'customer soport',
            'language' => 'en',
        ], [
            'X-Session-ID' => 'sess_support_test_02',
        ]);

        $response->assertStatus(200);
        $content = $response->json('data.content');

        $this->assertStringContainsString('Support Ticket', $content);
        $this->assertNotEmpty($response->json('data.metadata.ticket'));
        $this->assertEmpty($response->json('data.metadata.products'));
    }
}
