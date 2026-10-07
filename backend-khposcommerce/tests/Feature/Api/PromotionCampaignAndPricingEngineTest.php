<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Warehouse;
use App\Models\Product\Product;
use App\Models\Product\Brand;
use App\Models\Product\Category;
use App\Models\Marketing\PromotionCampaign;
use App\Models\Marketing\PromotionRule;
use App\Models\Marketing\PromotionCoupon;
use App\Models\Marketing\PromotionUsage;
use App\Services\Sales\PricingEngineService;
use App\Services\Sales\SaleService;
use Laravel\Sanctum\Sanctum;

class PromotionCampaignAndPricingEngineTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Company $company;
    protected Branch $branchPP;
    protected Branch $branchTK;
    protected Product $iphone;
    protected Product $samsung;
    protected Brand $samsungBrand;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'  => 'Test Company',
            'code'  => 'TC01',
            'slug'  => 'test-company',
            'email' => 'test@company.com',
        ]);

        $this->branchPP = Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'Phnom Penh Branch',
            'code'       => 'PP01',
            'is_active'  => true,
        ]);
        
        $this->branchTK = Branch::create([
            'company_id' => $this->company->id,
            'name'       => 'Kampong Cham Branch',
            'code'       => 'KC01',
            'is_active'  => true,
        ]);

        Warehouse::create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchPP->id,
            'name'       => 'PP Warehouse',
            'code'       => 'WHPP',
            'is_active'  => true,
        ]);

        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchPP->id,
        ]);

        $this->samsungBrand = Brand::firstOrCreate(
            ['name' => 'Samsung Test Brand', 'company_id' => $this->company->id],
            ['slug' => 'samsung-test-brand', 'is_active' => true]
        );

        $this->iphone = Product::firstOrCreate(
            ['sku' => 'TEST-IPHONE-15', 'company_id' => $this->company->id],
            ['name' => 'iPhone 15 Pro Max Test', 'slug' => 'test-iphone-15', 'selling_price' => 1000.00, 'cost_price' => 800.00, 'track_inventory' => false]
        );

        $this->samsung = Product::firstOrCreate(
            ['sku' => 'TEST-SAMS-S24', 'company_id' => $this->company->id],
            ['name' => 'Samsung S24 Ultra Test', 'slug' => 'test-samsung-s24', 'brand_id' => $this->samsungBrand->id, 'selling_price' => 1000.00, 'cost_price' => 800.00, 'track_inventory' => false]
        );
    }

    public function test_pricing_engine_calculates_discounts_and_respects_branch_scope(): void
    {
        // 1. Create Promotion Campaign: Khmer New Year 2026
        $campaign = PromotionCampaign::create([
            'company_id'   => $this->company->id,
            'name'         => 'Khmer New Year 2026 Test',
            'code'         => 'TEST-KHNY2026',
            'status'       => 'active',
            'start_at'     => now()->subDays(1),
            'end_at'       => now()->addDays(30),
            'priority'     => 10,
            'is_stackable' => true,
            'is_active'    => true,
        ]);

        // Attached to Phnom Penh branch ONLY (Kampong Cham is excluded)
        $campaign->branches()->sync([$this->branchPP->id]);
        $campaign->channels()->create(['channel' => 'all']);

        // Rule 1: iPhone -> 5% OFF (product_discount)
        $rule1 = $campaign->rules()->create([
            'name'           => 'iPhone 5% OFF',
            'rule_type'      => 'product_discount',
            'discount_type'  => 'percentage',
            'discount_value' => 5.00,
            'priority'       => 50,
            'is_stackable'   => true,
            'is_active'      => true,
        ]);
        $rule1->products()->sync([$this->iphone->id]);

        // Rule 2: Samsung Brand -> 10% OFF (brand_discount)
        $rule2 = $campaign->rules()->create([
            'name'           => 'Samsung 10% OFF',
            'rule_type'      => 'brand_discount',
            'discount_type'  => 'percentage',
            'discount_value' => 10.00,
            'priority'       => 60,
            'is_stackable'   => true,
            'is_active'      => true,
        ]);
        $rule2->brands()->sync([$this->samsungBrand->id]);

        // Rule 3: Order >= $100 -> $5 OFF (cart_discount)
        $campaign->rules()->create([
            'name'           => 'Order >= $100 Save $5',
            'rule_type'      => 'cart_discount',
            'discount_type'  => 'fixed_amount',
            'discount_value' => 5.00,
            'min_subtotal'   => 100.00,
            'priority'       => 10,
            'is_stackable'   => true,
            'is_active'      => true,
        ]);

        $engine = app(PricingEngineService::class);

        // A. Calculation for Phnom Penh (Authorized Branch)
        $resultPP = $engine->calculate([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchPP->id,
            'channel'    => 'pos',
            'items'      => [
                ['product_id' => $this->iphone->id, 'quantity' => 1, 'unit_price' => 1000.00],
                ['product_id' => $this->samsung->id, 'quantity' => 1, 'unit_price' => 1000.00],
            ],
        ]);

        // iPhone: 5% of $1000 = $50
        // Samsung: 10% of $1000 = $100
        // Subtotal = $2000 >= $100 -> Cart discount = $5
        // Total discount = $50 + $100 + $5 = $155
        // Grand total = $1845
        $this->assertEquals(2000.00, $resultPP['summary']['subtotal']);
        $this->assertEquals(155.00, $resultPP['summary']['total_discount']);
        $this->assertEquals(1845.00, $resultPP['summary']['grand_total']);
        $this->assertCount(3, $resultPP['applied_promotions']);

        // Check line snapshots
        $iphoneLine = collect($resultPP['items'])->firstWhere('product_id', $this->iphone->id);
        $this->assertEquals(50.00, $iphoneLine['discount_amount']);
        $this->assertEquals(950.00, $iphoneLine['final_unit_price']);
        $this->assertEquals($campaign->id, $iphoneLine['promotion_id']);
        $this->assertEquals($rule1->id, $iphoneLine['promotion_rule_id']);

        // B. Calculation for Kampong Cham (Excluded Branch)
        $resultKC = $engine->calculate([
            'company_id' => $this->company->id,
            'branch_id'  => $this->branchTK->id,
            'channel'    => 'pos',
            'items'      => [
                ['product_id' => $this->iphone->id, 'quantity' => 1, 'unit_price' => 1000.00],
                ['product_id' => $this->samsung->id, 'quantity' => 1, 'unit_price' => 1000.00],
            ],
        ]);

        // Promotion does NOT apply to excluded branch!
        $this->assertEquals(2000.00, $resultKC['summary']['subtotal']);
        $this->assertEquals(0.00, $resultKC['summary']['total_discount']);
        $this->assertEquals(2000.00, $resultKC['summary']['grand_total']);
        $this->assertEmpty($resultKC['applied_promotions']);
    }

    public function test_pricing_calculate_api_endpoint(): void
    {
        $token = app(\App\Services\Auth\JwtTokenService::class)->generateAccessToken($this->user)['token'];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Company-Id'  => (string) $this->company->id,
            'X-Branch-Id'   => (string) $this->branchPP->id,
        ])->postJson('/api/v1/admin/pricing/calculate', [
            'branch_id' => $this->branchPP->id,
            'channel'   => 'pos',
            'items'     => [
                ['product_id' => $this->iphone->id, 'quantity' => 1, 'unit_price' => 1000.00],
            ],
            'coupon_code' => 'KHNY2026',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'summary' => [
                    'subtotal',
                    'total_discount',
                    'grand_total',
                ],
                'items',
                'applied_promotions',
            ],
        ]);
    }

    public function test_sale_process_records_discount_snapshot_and_usages(): void
    {
        $saleService = app(SaleService::class);

        $campaign = PromotionCampaign::create([
            'company_id'   => $this->company->id,
            'name'         => 'Snapshot Test Campaign',
            'code'         => 'TEST-SNAP-01',
            'status'       => 'active',
            'start_at'     => now()->subDays(1),
            'end_at'       => now()->addDays(30),
            'priority'     => 10,
            'is_stackable' => true,
            'is_active'    => true,
        ]);

        $saleData = [
            'company_id'         => $this->company->id,
            'branch_id'          => $this->branchPP->id,
            'subtotal'           => 1000.00,
            'discount_amount'    => 50.00,
            'grand_total'        => 950.00,
            'paid_amount'        => 950.00,
            'change_amount'      => 0.00,
            'payment_method'     => 'cash',
            'items'              => [
                [
                    'product_id'         => $this->iphone->id,
                    'quantity'           => 1,
                    'unit_price'         => 1000.00,
                    'discount_amount'    => 50.00,
                    'discount_type'      => 'percentage',
                    'promotion_id'       => $campaign->id,
                    'promotion_rule_id'  => null,
                    'final_unit_price'   => 950.00,
                    'tax_percent'        => 0.0,
                    'tax_amount'         => 0.0,
                    'subtotal'           => 950.00,
                    'total'              => 950.00,
                ],
            ],
            'applied_promotions' => [
                [
                    'campaign_id'     => $campaign->id,
                    'discount_amount' => 50.00,
                ],
            ],
        ];

        $sale = $saleService->processSale($saleData, $this->user);

        $this->assertNotNull($sale);
        $this->assertEquals(950.00, (float) $sale->grand_total);

        // Check snapshot in sale_items
        $item = $sale->items->first();
        $this->assertEquals(1000.00, (float) $item->unit_price);
        $this->assertEquals(50.00, (float) $item->discount_amount);
        $this->assertEquals('percentage', $item->discount_type);
        $this->assertEquals(950.00, (float) $item->final_unit_price);
        $this->assertEquals($campaign->id, $item->promotion_id);

        // Check promotion usages record
        $this->assertDatabaseHas('promotion_usages', [
            'sale_id'               => $sale->id,
            'promotion_campaign_id' => $campaign->id,
            'discount_amount'       => 50.00,
        ]);
    }
}
