<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Customer\CustomerGroup;
use App\Models\Marketing\PromotionCampaign;
use App\Models\Marketing\PromotionRule;
use App\Models\Marketing\PromotionCoupon;

class PromotionCampaignSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;
        $branches = Branch::where('company_id', $companyId)->get();
        $branchPhnomPenh = $branches->firstWhere('code', 'A') ?? $branches->first();
        $branchSiemReap  = $branches->firstWhere('code', 'C') ?? $branches->skip(2)->first() ?? $branches->first();
        $branchTbongKhmum = $branches->firstWhere('code', 'B') ?? $branches->skip(1)->first() ?? $branches->first();

        $appleBrand   = Brand::where('name', 'ilike', '%apple%')->first() ?? Brand::first();
        $samsungBrand = Brand::where('name', 'ilike', '%samsung%')->first() ?? Brand::skip(1)->first() ?? Brand::first();
        $accCategory  = Category::where('name', 'ilike', '%accessories%')->first() ?? Category::first();

        $iphoneProduct = Product::where('name', 'ilike', '%iphone%')->first() ?? Product::first();
        $samsungProduct = Product::where('name', 'ilike', '%samsung%')->first() ?? Product::skip(1)->first() ?? Product::first();
        $caseProduct = Product::where('name', 'ilike', '%case%')->first() ?? Product::skip(2)->first() ?? Product::first();
        $screenProduct = Product::where('name', 'ilike', '%screen%')->first() ?? Product::skip(3)->first() ?? Product::first();

        $vipGroup = CustomerGroup::where('name', 'ilike', '%vip%')->first() ?? CustomerGroup::first();

        // ─── 1. Campaign: Khmer New Year 2026 ────────────────────────────────────
        $campaign1 = PromotionCampaign::updateOrCreate(
            ['code' => 'KHNY2026', 'company_id' => $companyId],
            [
                'name'         => 'Khmer New Year Mega Celebration 2026',
                'description'  => 'Massive festive discounts on flagship smartphones, accessories, and storewide purchases.',
                'status'       => 'active',
                'start_at'     => now()->subDays(5),
                'end_at'       => now()->addDays(40),
                'priority'     => 100,
                'is_stackable' => true,
                'is_active'    => true,
                'usage_limit'  => 1000,
                'usage_count'  => 42,
            ]
        );

        // Scope Branches: Phnom Penh and Siem Reap (excludes Kampong Cham / Tbong Khmum)
        $campaign1Branches = array_filter([$branchPhnomPenh?->id, $branchSiemReap?->id]);
        $campaign1->branches()->sync($campaign1Branches);

        // Scope Channels: POS, Web, Mobile
        $campaign1->channels()->delete();
        $campaign1->channels()->create(['channel' => 'all']);

        // Clear existing rules and recreate
        $campaign1->rules()->delete();

        // Rule 1: iPhone -> 5% OFF
        if ($iphoneProduct) {
            $rule1 = $campaign1->rules()->create([
                'name'                => 'iPhone Series 5% Instant Festive OFF',
                'rule_type'           => 'product_discount',
                'discount_type'       => 'percentage',
                'discount_value'      => 5.00,
                'min_qty'             => 1,
                'max_discount_amount' => 50.00,
                'priority'            => 50,
                'is_stackable'        => true,
                'is_active'           => true,
            ]);
            $rule1->products()->sync([$iphoneProduct->id]);
        }

        // Rule 2: Samsung Phones -> 10% OFF
        if ($samsungBrand) {
            $rule2 = $campaign1->rules()->create([
                'name'                => 'Samsung Galaxy Brand 10% OFF',
                'rule_type'           => 'brand_discount',
                'discount_type'       => 'percentage',
                'discount_value'      => 10.00,
                'min_qty'             => 1,
                'max_discount_amount' => 80.00,
                'priority'            => 60,
                'is_stackable'        => true,
                'is_active'           => true,
            ]);
            $rule2->brands()->sync([$samsungBrand->id]);
        }

        // Rule 3: Order >= $100 -> $5 OFF
        $rule3 = $campaign1->rules()->create([
            'name'                => 'Cart Spend Over $100 Save $5',
            'rule_type'           => 'cart_discount',
            'discount_type'       => 'fixed_amount',
            'discount_value'      => 5.00,
            'min_subtotal'        => 100.00,
            'priority'            => 20,
            'is_stackable'        => true,
            'is_active'           => true,
        ]);

        // Rule 4: Buy 2 Accessories -> 1 Screen Protector FREE
        if ($caseProduct && $screenProduct) {
            $rule4 = $campaign1->rules()->create([
                'name'           => 'Buy 2 Phone Cases Get 1 Screen Protector FREE',
                'rule_type'      => 'buy_x_get_y',
                'discount_type'  => 'free_item',
                'discount_value' => 100.00,
                'priority'       => 40,
                'is_stackable'   => true,
                'is_active'      => true,
            ]);
            $rule4->buyXGetY()->create([
                'buy_quantity'   => 2,
                'get_quantity'   => 1,
                'buy_product_id' => $caseProduct->id,
                'get_product_id' => $screenProduct->id,
                'discount_type'  => 'percentage',
                'discount_value' => 100,
            ]);
        }

        // Coupon for Campaign 1
        PromotionCoupon::updateOrCreate(
            ['code' => 'KHNY2026', 'promotion_campaign_id' => $campaign1->id],
            [
                'usage_limit'        => 500,
                'usage_per_customer' => 1,
                'used_count'         => 18,
                'starts_at'          => now()->subDays(5),
                'expires_at'         => now()->addDays(40),
                'is_active'          => true,
            ]
        );

        // ─── 2. Campaign: Phnom Penh HQ Exclusive VIP Flash ──────────────────────
        $campaign2 = PromotionCampaign::updateOrCreate(
            ['code' => 'PPVIP2026', 'company_id' => $companyId],
            [
                'name'         => 'Phnom Penh HQ VIP Members 15% Storewide',
                'description'  => 'Exclusive in-store loyalty discount for registered VIP tier customers at Phnom Penh flagship.',
                'status'       => 'active',
                'start_at'     => now()->subDays(2),
                'end_at'       => now()->addDays(60),
                'priority'     => 150,
                'is_stackable' => false,
                'is_active'    => true,
                'usage_limit'  => 200,
                'usage_count'  => 15,
            ]
        );

        if ($branchPhnomPenh) {
            $campaign2->branches()->sync([$branchPhnomPenh->id]);
        }
        $campaign2->channels()->delete();
        $campaign2->channels()->create(['channel' => 'pos']);

        if ($vipGroup) {
            $campaign2->customerGroups()->sync([$vipGroup->id]);
        }

        $campaign2->rules()->delete();
        $campaign2->rules()->create([
            'name'                => 'VIP Tier 15% Cart Discount',
            'rule_type'           => 'cart_discount',
            'discount_type'       => 'percentage',
            'discount_value'      => 15.00,
            'min_subtotal'        => 50.00,
            'max_discount_amount' => 150.00,
            'priority'            => 100,
            'is_stackable'        => false,
            'is_active'           => true,
        ]);

        PromotionCoupon::updateOrCreate(
            ['code' => 'VIPHQ15', 'promotion_campaign_id' => $campaign2->id],
            [
                'usage_limit'        => 100,
                'usage_per_customer' => 1,
                'used_count'         => 9,
                'starts_at'          => now()->subDays(2),
                'expires_at'         => now()->addDays(60),
                'is_active'          => true,
            ]
        );
    }
}
