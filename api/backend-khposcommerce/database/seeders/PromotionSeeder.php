<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Branch;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;
        $branchId = Branch::value('id') ?? 1;

        // 1. Coupons (Authentic USD E-Commerce Vouchers)
        $couponTemplates = [
            ['name' => 'Khmer New Year Mega Celebration',      'code' => 'KHMERNEWYEAR', 'type' => 'fixed',         'val' => 0.20, 'min' => 0.80, 'max' => 0.20],
            ['name' => 'New Enterprise Customer Welcome',       'code' => 'WELCOMEPOS',   'type' => 'fixed',         'val' => 0.10, 'min' => 0.50, 'max' => 0.10],
            ['name' => 'Phnom Penh Free Express Delivery',     'code' => 'FREESHIPPP',   'type' => 'free_shipping', 'val' => 0.00, 'min' => 0.30, 'max' => 0.25],
            ['name' => 'Annual Consumer Tech Expo Promo',       'code' => 'TECHFEST2026', 'type' => 'percentage',    'val' => 15.00, 'min' => 0.75, 'max' => 0.25],
            ['name' => 'B2B Corporate Account Discount',        'code' => 'VIPENTERPRISE','type' => 'fixed',         'val' => 0.25, 'min' => 0.90, 'max' => 0.25],
            ['name' => 'ABA & Bakong KHQR Cash Voucher',        'code' => 'PAYWITHKHQR',  'type' => 'fixed',         'val' => 0.05, 'min' => 0.25, 'max' => 0.05],
            ['name' => 'Mid-Year Flagship Flash Deals',         'code' => 'SUMMERDEALS',  'type' => 'percentage',    'val' => 10.00, 'min' => 0.50, 'max' => 0.20],
            ['name' => 'Asus ROG Gaming Peripherals Coupon',    'code' => 'GAMINGZONE',   'type' => 'fixed',         'val' => 0.15, 'min' => 0.60, 'max' => 0.15],
            ['name' => 'Official Apple Authorized Voucher',     'code' => 'APPLEOFFICIAL','type' => 'fixed',         'val' => 0.20, 'min' => 0.70, 'max' => 0.20],
            ['name' => 'Water Festival Special Bon Om Touk',    'code' => 'WATERFESTIVAL','type' => 'percentage',    'val' => 12.00, 'min' => 0.50, 'max' => 0.20],
        ];

        DB::table('coupon_products')->truncate();
        DB::table('coupons')->truncate();
        $coupons = [];
        for ($i = 1; $i <= 10; $i++) {
            $t = $couponTemplates[$i - 1];
            $coupons[] = [
                'id' => $i,
                'company_id' => $companyId,
                'name' => $t['name'],
                'code' => $t['code'],
                'type' => $t['type'],
                'value' => $t['val'],
                'min_purchase' => $t['min'],
                'max_discount' => $t['max'],
                'usage_limit' => 250,
                'usage_limit_per_customer' => 1,
                'used_count' => rand(15, 85),
                'starts_at' => now()->subDays(15),
                'expires_at' => now()->addDays(45),
                'is_active' => true,
                'created_at' => now()->subDays(15),
                'updated_at' => now(),
            ];
        }
        DB::table('coupons')->insert($coupons);

        // 2. Coupon Products (10 records)
        $couponProducts = [];
        for ($i = 1; $i <= 10; $i++) {
            $couponProducts[] = [
                'coupon_id' => $i,
                'product_id' => ($i * 9) % 100 + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('coupon_products')->insert($couponProducts);

        // 3. Flash Sales (Authentic Retail Events)
        $flashSaleNames = [
            'Weekend Tech Mega Blast Sale',
            'Mid-Month Payday Flash Frenzy',
            'Flagship Smartphones Weekend Drop',
            'Gaming Laptops & High-Refresh Monitors Clearance',
            'Creator Audio & Studio Cinema Cameras Promo',
            'Fast Chargers & GaN Accessories Mega Drop',
            'Mechanical Keyboards & Peripherals Expo',
            'Smartwatches & Health Tech Flash Hours',
            'Sneakers & Streetwear Limited Release',
            'End of Quarter Enterprise Liquidation',
        ];

        DB::table('flash_sale_products')->truncate();
        DB::table('flash_sales')->truncate();
        $flashSales = [];
        for ($i = 1; $i <= 10; $i++) {
            $flashSales[] = [
                'id' => $i,
                'company_id' => $companyId,
                'name' => $flashSaleNames[$i - 1],
                'starts_at' => now()->subDays(1),
                'ends_at' => now()->addDays(3),
                'is_active' => true,
                'created_at' => now()->subDays(1),
                'updated_at' => now(),
            ];
        }
        DB::table('flash_sales')->insert($flashSales);

        // 4. Flash Sale Products (10 records with realistic USD flash pricing under $1.00)
        $flashSaleProducts = [];
        $flashPrices = [0.89, 0.79, 0.45, 0.95, 0.59, 0.19, 0.49, 0.69, 0.35, 0.15];
        for ($i = 1; $i <= 10; $i++) {
            $flashSaleProducts[] = [
                'flash_sale_id' => $i,
                'product_id' => ($i * 8) % 100 + 1,
                'product_variant_id' => null,
                'flash_price' => $flashPrices[$i - 1],
                'discount_percent' => 15.0000,
                'quota' => 50,
                'sold_count' => rand(5, 35),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('flash_sale_products')->insert($flashSaleProducts);

        // 5. Promotions (10 Authentic Multi-Item Promotional Programs)
        $promotionsData = [
            ['name' => 'Buy MacBook Pro, Get 70W USB-C Charger 50% Off', 'type' => 'bundle',       'desc' => 'Upgrade your workstation bundle with genuine Apple accessories.'],
            ['name' => 'Sony Audio Ecosystem: Save $0.15 on XM5 Headset', 'type' => 'fixed',        'desc' => 'Buy any Sony Alpha camera and receive $0.15 instant discount on WH-1000XM5.'],
            ['name' => 'Samsung Galaxy Ecosystem Pack (Phone + Watch6)',   'type' => 'percentage',   'desc' => 'Combine Galaxy S24 Ultra with Galaxy Watch 6 Classic for 10% off.'],
            ['name' => 'Enterprise Workstation: Monitor + MX Mechanical',  'type' => 'bundle',       'desc' => 'Equip your office with Dell UltraSharp 4K and Logitech MX Mechanical.'],
            ['name' => 'ROG Esports Gamer Kit: Laptop + Azoth Keyboard',  'type' => 'bundle',       'desc' => 'Ultimate gaming combo with ROG Strix SCAR 18 and Azoth 75% custom.'],
            ['name' => 'Creator Video Kit: Sony FX3 + 24-70mm G Master',  'type' => 'percentage',   'desc' => 'Save 8% when purchasing full cinema setup with professional lens.'],
            ['name' => 'Smartphone Fast-Charge Trio Pack (GaN 120W)',      'type' => 'buy_x_get_y',  'desc' => 'Buy 2 Xiaomi Fast Chargers, get 1 USB-C Braided Cable free.'],
            ['name' => 'Khmer New Year Tech Hamper Gift Set',             'type' => 'bundle',       'desc' => 'Festive seasonal gift pack with smartwatch, earbuds, and fast powerbank.'],
            ['name' => 'Corporate Bulk Purchase Volume Rebate',           'type' => 'fixed',        'desc' => 'Save $0.20 on bulk hardware orders over $0.80.'],
            ['name' => 'Free Express Nationwide Courier Delivery',         'type' => 'free_item',    'desc' => 'Complimentary door-to-door delivery with Virak Buntham across 25 provinces.'],
        ];

        DB::table('promotions')->truncate();
        $promotions = [];
        for ($i = 1; $i <= 10; $i++) {
            $p = $promotionsData[$i - 1];
            $promotions[] = [
                'id' => $i,
                'company_id' => $companyId,
                'name' => $p['name'],
                'description' => $p['desc'],
                'type' => $p['type'],
                'conditions' => json_encode(['min_qty' => 1, 'min_amount' => 0.50]),
                'rewards' => json_encode(['discount_percent' => 10, 'discount_fixed' => 0.15]),
                'starts_at' => now()->subDays(10),
                'ends_at' => now()->addDays(30),
                'priority' => $i,
                'is_active' => true,
                'created_at' => now()->subDays(10),
                'updated_at' => now(),
            ];
        }
        DB::table('promotions')->insert($promotions);

        // 6. Product Reviews (Authentic Verified Customer Feedback)
        $reviewsData = [
            ['pid' => 1,  'cid' => 1,  'rating' => 5, 'title' => 'Stunning Titanium build & battery life!', 'body' => 'Upgraded from iPhone 12 Pro. The camera zoom is crystal clear during my trip to Angkor Wat. Battery easily lasts 1.5 days.'],
            ['pid' => 2,  'cid' => 2,  'rating' => 5, 'title' => 'Galaxy AI features are super helpful',     'body' => 'The anti-reflective screen on the S24 Ultra is the best display on the market. S Pen is great for signing PDF invoices.'],
            ['pid' => 11, 'cid' => 3,  'rating' => 5, 'title' => 'Absolute powerhouse for video editing',     'body' => 'Rendered 4K ProRes videos without breaking a sweat or turning on the fans. The Liquid Retina XDR screen is color accurate.'],
            ['pid' => 21, 'cid' => 4,  'rating' => 5, 'title' => 'Massive 49-inch OLED gaming immersion',    'body' => 'Multitasking 3 windows side-by-side during stock analysis and gaming at 240Hz at night is pure perfection.'],
            ['pid' => 31, 'cid' => 5,  'rating' => 5, 'title' => 'Rugged, bright, and accurate GPS',        'body' => 'Great for cycling around Phnom Penh and hiking in Cardamom mountains. The titanium case is scratch resistant.'],
            ['pid' => 41, 'cid' => 6,  'rating' => 5, 'title' => 'Best mechanical keyboard for coding',      'body' => 'Tactile quiet switches provide satisfying feedback without disturbing colleagues in the office. Easy-switch connects to Mac and PC.'],
            ['pid' => 51, 'cid' => 7,  'rating' => 5, 'title' => 'Unbeatable ANC on flights and cafe work',  'body' => 'Active noise cancellation completely silences coffee shop chatter. Lightweight and super comfortable for long sessions.'],
            ['pid' => 61, 'cid' => 8,  'rating' => 5, 'title' => 'Workhorse camera for commercial shoots',   'body' => 'Autofocus eye-tracking is magical. 10-bit 4:2:2 video gives insane color grading latitude in DaVinci Resolve.'],
            ['pid' => 71, 'cid' => 9,  'rating' => 5, 'title' => 'Compact and cool GaN fast charger',        'body' => 'Charges my MacBook Air and iPhone quickly without heating up. Compact enough for my travel bag.'],
            ['pid' => 81, 'cid' => 10, 'rating' => 4, 'title' => 'Super comfortable all-day walking shoe',   'body' => 'Air Max cushioning gives great heel support when walking around Aeon Mall. Runs true to size.'],
        ];

        DB::table('review_images')->truncate();
        DB::table('product_reviews')->truncate();
        $reviews = [];
        $reviewImages = [];
        for ($i = 1; $i <= 10; $i++) {
            $r = $reviewsData[$i - 1];
            $cust = DB::table('customers')->where('id', $r['cid'])->first();
            $cName = $cust ? $cust->name : "Customer $i";
            $cEmail = $cust ? $cust->email : "customer$i@gmail.com";

            $reviews[] = [
                'id' => $i,
                'product_id' => $r['pid'],
                'customer_id' => $r['cid'],
                'order_item_id' => null,
                'name' => $cName,
                'email' => $cEmail,
                'rating' => $r['rating'],
                'title' => $r['title'],
                'body' => $r['body'],
                'status' => 'approved',
                'is_verified_purchase' => true,
                'created_at' => now()->subDays(rand(2, 45)),
                'updated_at' => now(),
            ];

            // 7. Review Images (100% PRESERVED high-res sample asset paths)
            $reviewImages[] = [
                'product_review_id' => $i,
                'image' => "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('product_reviews')->insert($reviews);
        DB::table('review_images')->insert($reviewImages);

        // 8. Expense Categories (10 Authentic Categories)
        DB::table('expenses')->truncate();
        DB::table('expense_categories')->truncate();
        $expenseCategories = [];
        $expNames = [
            'Retail Store Lease & Rent',
            'High-Speed Fiber Internet & Telephony',
            'Warehouse Electricity & Air Conditioning',
            'Packaging Boxes & Protective Bubblewrap',
            'Logistics Fleet Delivery & Fuel',
            'Staff Welfare & Catering',
            'Digital Marketing & Meta Ads',
            'Cloud Infrastructure & POS Server Hosting',
            'Security System & CCTV Monitoring',
            'Store Maintenance & POS Consumables'
        ];

        foreach ($expNames as $i => $name) {
            $expenseCategories[] = [
                'id' => $i + 1,
                'company_id' => $companyId,
                'name' => $name,
                'code' => 'EXP-' . strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 4)),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('expense_categories')->insert($expenseCategories);

        // 9. Expenses (10 Authentic USD Operational Records)
        $expenses = [];
        $realisticAmounts = [1200.00, 110.00, 450.00, 180.00, 220.00, 140.00, 350.00, 195.00, 85.00, 65.00];
        for ($i = 1; $i <= 10; $i++) {
            $expenses[] = [
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'expense_category_id' => $i,
                'user_id' => 1,
                'reference_number' => 'EXP-' . date('Ym') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'title' => "Monthly Outlay for " . $expNames[$i - 1],
                'description' => 'Official monthly operational business expenditure voucher with tax receipt.',
                'amount' => $realisticAmounts[$i - 1],
                'date' => now()->subDays(max(1, 13 - $i))->format('Y-m-d'),
                'receipt' => "receipts/receipt-$i.jpg",
                'status' => 'approved',
                'created_at' => now()->subDays(max(1, 13 - $i)),
                'updated_at' => now(),
            ];
        }
        DB::table('expenses')->insert($expenses);

        if (DB::getDriverName() === 'pgsql') {
            $tables = ['coupons', 'coupon_products', 'flash_sales', 'flash_sale_products', 'promotions', 'product_reviews', 'review_images', 'expense_categories', 'expenses'];
            foreach ($tables as $table) {
                try {
                    DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false);");
                } catch (\Throwable $e) {}
            }
        }
    }
}
