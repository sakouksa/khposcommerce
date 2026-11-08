<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UpdateEnterpriseDbCommand extends Command
{
    protected $signature = 'app:update-enterprise-db';
    protected $description = 'Audit and update all media image columns and convert all monetary figures to realistic USD values without inserting any new records.';

    public function handle()
    {
        $this->info("=========================================================");
        $this->info(" STARTING ENTERPRISE DATABASE UPDATE (UPDATE ONLY) ");
        $this->info("=========================================================");

        DB::beginTransaction();

        try {
            $this->updateImages();
            $this->updateProductPrices();
            $this->updateLinkedFinancials();

            DB::commit();
            $this->info("\n✅ SUCCESS: Enterprise database successfully updated!");
            return 0;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("\n❌ ERROR during database update: " . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
    }

    private function updateImages()
    {
        $this->info("\n--- STEP 1: Updating Images & Media Columns ---");

        // Curated high quality avatars (100% local project storage)
        $avatars = [
            'customers/avatar_01.png',
            'customers/avatar_02.png',
            'customers/avatar_03.png',
            'customers/avatar_04.png',
            'customers/avatar_05.png',
            'customers/avatar_06.png',
            'customers/avatar_07.png',
            'customers/avatar_08.png',
            'customers/avatar_09.png',
            'customers/avatar_10.png',
        ];

        // 1. Employees photo
        if (Schema::hasTable('employees')) {
            $employees = DB::table('employees')->get();
            foreach ($employees as $idx => $emp) {
                $photo = $avatars[$idx % count($avatars)];
                DB::table('employees')->where('id', $emp->id)->update(['photo' => $photo]);
            }
            $this->info("Updated photos for " . count($employees) . " employees.");
        }

        // 2. Users avatar
        if (Schema::hasTable('users')) {
            $users = DB::table('users')->get();
            foreach ($users as $idx => $usr) {
                $avatar = $avatars[$idx % count($avatars)];
                DB::table('users')->where('id', $usr->id)->update(['avatar' => $avatar]);
            }
            $this->info("Updated avatars for " . count($users) . " users.");
        }

        // 3. Customers photo (first 50 have real photos, remaining 50 have null)
        if (Schema::hasTable('customers')) {
            $customers = DB::table('customers')->orderBy('id')->get();
            foreach ($customers as $idx => $cust) {
                $photo = ($idx < 50) ? 'customers/avatar_' . str_pad($idx + 1, 2, '0', STR_PAD_LEFT) . '.png' : null;
                DB::table('customers')->where('id', $cust->id)->update(['photo' => $photo]);
            }
            $this->info("Updated photos for " . count($customers) . " customers.");
        }

        // 4. Brands logo
        $brandLogos = [
            'Apple' => 'brands/qX70vzlzGVFDjHAsluDn1EGPlMjlUHPZXlmdfeDS.png',
            'Samsung' => 'brands/FiXyuhj9Np3Ky1xR5JTrpBeBvkIA9SD7oRsqccs2.png',
            'Xiaomi' => 'brands/0KtGSdMlR7kopFcut30hRUpRdvhgWUExdoTPVPwp.png',
            'Oppo' => 'brands/51fLxokZiFKKypyZ12or4TdwDs5ReXHjFzZRuOQ6.png',
            'Asus' => 'brands/CdHKXmo8Xl0T3Aij6TFafqJke6YcHXwOX74vuh4p.png',
            'HP' => 'brands/x9QSFCpGRWXvV2KbVzGbItEPWgXrCAib0zjuCzh1.svg',
            'Dell' => 'brands/EgiwVDNx7zNHiGomB8sqWrxzZEcyMdc2a82veCuj.webp',
            'Sony' => 'brands/k4CiKnXgghYI7RqSsOn9hyaV0uovEr4RyHU1i9tG.jpg',
            'JBL' => 'brands/OQRP7XaB3cweJut3qfWkr4OABrhFUpyJ42fDtJV9.webp',
            'Logitech' => 'brands/VOeFabRbWYXAbpg5N2PUCUUrS9aId2e8JpNGBgAf.jpg',
        ];
        if (Schema::hasTable('brands')) {
            foreach ($brandLogos as $brandName => $logoPath) {
                DB::table('brands')->where('name', $brandName)->update(['logo' => $logoPath]);
            }
            $this->info("Updated logos for brands.");
        }

        // 5. Categories image
        $catImages = [
            'Smartphones' => 'categories/6xXCq8pD8wtzloeI4wW7KgQxAL1b1DBHECqVu0r2.jpg',
            'Laptops' => 'categories/PIf2fWj4R6JlL7jl1t1RZqLDjTQA9keAZ2THQNs0.webp',
            'Headphones' => 'categories/jn84kLGyhJwttR3R7KFpqujo9I3Hy4ze2nHfrPqZ.webp',
            'Keyboards' => 'categories/AwbfQ44v5jUmxD6fkfE7Lyk5UYrQaaYKcBEstSck.webp',
            'Mice' => 'categories/ahoxzKbZG7dfnftqWOJAjxfNBT0wJTqFBctFJDqn.jpg',
            'Monitors' => 'categories/J5z17UePaLVGm61VEYsVny15vi8BLbxtbBJxq2Vz.webp',
            'Cameras' => 'categories/PVlc9dasVPuzQfY1qEJ3ZAaAlVRGv7KSXGbyHO7Y.jpg',
            'Smartwatches' => 'categories/QdGADLsPilfoN7QtcyS4wUgI8l1FAyYqMYLREquK.jpg',
            'Speakers' => 'categories/5OQYyLwkbNTrfodQDQHGLN51PDhGw25X7WNVZpOk.jpg',
            'Chargers' => 'categories/DKCQGvKimr1y9El6pESIjPQ7zXcYJxLcenbOmc3f.jpg',
        ];
        if (Schema::hasTable('categories')) {
            foreach ($catImages as $catName => $imgPath) {
                DB::table('categories')->where('name', $catName)->update(['image' => $imgPath]);
            }
            $this->info("Updated images for categories.");
        }

        // 6. Companies logo
        if (Schema::hasTable('companies')) {
            $companyLogo = 'companies/logo.png';
            DB::table('companies')->whereNull('logo')->orWhere('logo', '')->update(['logo' => $companyLogo]);
            $this->info("Updated logos for companies.");
        }

        // 7. Stores logo & banner
        if (Schema::hasTable('stores')) {
            $storeLogo = 'companies/logo.png';
            $storeBanner = 'banners/banner_hero_1.webp';
            DB::table('stores')->whereNull('logo')->orWhere('logo', '')->update(['logo' => $storeLogo]);
            DB::table('stores')->whereNull('banner')->orWhere('banner', '')->update(['banner' => $storeBanner]);
            $this->info("Updated logos & banners for stores.");
        }

        // 8. Banners image & mobile_image
        if (Schema::hasTable('banners')) {
            $bannerImg = 'banners/banner_hero_1.webp';
            $mobileBanner = 'banners/banner_spotlight_1.webp';
            DB::table('banners')->whereNull('image')->orWhere('image', '')->update(['image' => $bannerImg]);
            DB::table('banners')->whereNull('mobile_image')->orWhere('mobile_image', '')->update(['mobile_image' => $mobileBanner]);
            $this->info("Updated images for banners.");
        }

        // 9. Blogs featured_image
        if (Schema::hasTable('blogs')) {
            $blogImg = 'blog/blog-01.jpg';
            DB::table('blogs')->whereNull('featured_image')->orWhere('featured_image', '')->update(['featured_image' => $blogImg]);
            $this->info("Updated featured_image for blogs.");
        }

        // 10. Warehouses pic_name
        if (Schema::hasTable('warehouses')) {
            $managers = ['Srey Roth - Manager', 'Kosal Vuth - Supervisor', 'Bopha Chan - Head Auditor', 'Sokha Meng - Operations'];
            $whs = DB::table('warehouses')->get();
            foreach ($whs as $i => $w) {
                $mgr = $managers[$i % count($managers)];
                DB::table('warehouses')->where('id', $w->id)->update(['pic_name' => $mgr]);
            }
            $this->info("Updated manager names for warehouses.");
        }

        // 11. Product Images per Category & Order Items (100% local project storage)
        $catPhotoMap = [
            'Smartphones'  => 'products/smartphones/product_1_1.webp',
            'Laptops'      => 'products/laptops/product_1_1.webp',
            'Headphones'   => 'products/audio/product_1_1.webp',
            'Keyboards'    => 'products/keyboards/product_1_1.webp',
            'Mice'         => 'products/keyboards/product_11_1.webp',
            'Monitors'     => 'products/monitors/product_1_1.webp',
            'Cameras'      => 'products/cameras/product_1_1.webp',
            'Smartwatches' => 'products/smartwatches/product_1_1.webp',
            'Speakers'     => 'products/audio/product_11_1.webp',
            'Chargers'     => 'products/chargers/product_1_1.webp',
            'Shoes'        => 'products/shoes/product_1_1.webp',
            'Apparel'      => 'products/apparel/product_1_1.webp',
        ];

        if (Schema::hasTable('product_images')) {
            $products = DB::table('products')
                ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                ->select('products.id', 'categories.name as cat_name')
                ->get();

            foreach ($products as $p) {
                $img = $catPhotoMap[$p->cat_name ?? ''] ?? 'products/smartphones/product_1_1.webp';
                DB::table('product_images')->where('product_id', $p->id)->where(function($q) {
                    $q->whereNull('image')->orWhere('image', '');
                })->update(['image' => $img]);
            }
            $this->info("Updated missing product_images.");
        }

        // Order Items product_image
        if (Schema::hasTable('order_items')) {
            $orderItems = DB::table('order_items')->whereNull('product_image')->orWhere('product_image', '')->get();
            foreach ($orderItems as $oi) {
                $prodImg = DB::table('product_images')->where('product_id', $oi->product_id)->value('image')
                    ?? 'products/smartphones/product_1_1.webp';
                DB::table('order_items')->where('id', $oi->id)->update(['product_image' => $prodImg]);
            }
            $this->info("Updated missing order_items.product_image.");
        }

        // Product Variants image
        if (Schema::hasTable('product_variants')) {
            $variants = DB::table('product_variants')->get();
            foreach ($variants as $v) {
                $vImg = DB::table('product_images')->where('product_id', $v->product_id)->value('image')
                    ?? 'products/smartphones/product_1_1.webp';
                DB::table('product_variants')->where('id', $v->id)->update(['image' => $vImg]);
            }
            $this->info("Updated product_variants images.");
        }
    }

    private function updateProductPrices()
    {
        $this->info("\n--- STEP 2: Converting Product Prices to Realistic USD Values ---");

        $products = DB::table('products')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select('products.id', 'products.name', 'categories.name as cat_name')
            ->get();

        foreach ($products as $p) {
            $cat = $p->cat_name ?? 'Default';
            
            // Deterministic realistic USD pricing based on ID & category
            $seed = $p->id;
            
            switch ($cat) {
                case 'Smartphones':
                    $cost = round(160 + ($seed * 7) % 350, 2); // $160 - $510
                    $margin = 0.30;
                    break;
                case 'Laptops':
                    $cost = round(320 + ($seed * 11) % 650, 2); // $320 - $970
                    $margin = 0.25;
                    break;
                case 'Mice':
                    $cost = round(7 + ($seed * 2) % 20, 2); // $7 - $27
                    $margin = 0.40;
                    break;
                case 'Keyboards':
                    $cost = round(14 + ($seed * 3) % 40, 2); // $14 - $54
                    $margin = 0.35;
                    break;
                case 'Monitors':
                    $cost = round(95 + ($seed * 5) % 180, 2); // $95 - $275
                    $margin = 0.28;
                    break;
                case 'Cameras':
                    $cost = round(220 + ($seed * 17) % 950, 2); // $220 - $1170
                    $margin = 0.25;
                    break;
                case 'Smartwatches':
                    $cost = round(45 + ($seed * 4) % 180, 2); // $45 - $225
                    $margin = 0.32;
                    break;
                case 'Speakers':
                    $cost = round(18 + ($seed * 3) % 110, 2); // $18 - $128
                    $margin = 0.35;
                    break;
                case 'Headphones':
                    $cost = round(15 + ($seed * 4) % 90, 2); // $15 - $105
                    $margin = 0.35;
                    break;
                case 'Chargers':
                default:
                    $cost = round(6 + ($seed * 2) % 22, 2); // $6 - $28
                    $margin = 0.40;
                    break;
            }

            $sell = round($cost * (1 + $margin), 2);
            $compare = round($sell * 1.18, 2); // Always 18% higher than selling price

            DB::table('products')->where('id', $p->id)->update([
                'cost_price' => $cost,
                'selling_price' => $sell,
                'compare_price' => $compare,
            ]);

            // Update Product Variants
            if (Schema::hasTable('product_variants')) {
                DB::table('product_variants')->where('product_id', $p->id)->update([
                    'cost_price' => $cost,
                    'selling_price' => $sell,
                    'compare_price' => $compare,
                ]);
            }

            // Update Product Prices table
            if (Schema::hasTable('product_prices')) {
                DB::table('product_prices')->where('product_id', $p->id)->update([
                    'price' => $sell,
                ]);
            }
        }

        $this->info("Updated realistic USD prices for " . count($products) . " products and variants.");
    }

    private function updateLinkedFinancials()
    {
        $this->info("\n--- STEP 3: Recalculating Linked Financial Data Across All Tables ---");

        // 1. Purchase Items & Purchases
        if (Schema::hasTable('purchase_items')) {
            $purchaseItems = DB::table('purchase_items')->get();
            foreach ($purchaseItems as $pi) {
                $prod = DB::table('products')->where('id', $pi->product_id)->first();
                $cost = $prod ? $prod->cost_price : 50.00;
                $pName = (property_exists($pi, 'product_name') && $pi->product_name) ? $pi->product_name : ($prod ? $prod->name : 'Unknown Product');
                $pSku = (property_exists($pi, 'product_sku') && $pi->product_sku) ? $pi->product_sku : ($prod ? $prod->sku : '');
                $qty = $pi->quantity;
                $subtotal = round($cost * $qty, 2);
                $discPct = $pi->discount_percent ?? 0;
                $discAmt = round($subtotal * ($discPct / 100), 2);
                $taxPct = $pi->tax_percent ?? 0;
                $taxAmt = round(($subtotal - $discAmt) * ($taxPct / 100), 2);
                $total = round($subtotal - $discAmt + $taxAmt, 2);

                $updData = [
                    'unit_cost' => $cost,
                    'unit_cost_base' => $cost,
                    'subtotal' => $subtotal,
                    'subtotal_base' => $subtotal,
                    'discount_amount' => $discAmt,
                    'tax_amount' => $taxAmt,
                    'total' => $total,
                    'total_base' => $total,
                ];
                if (Schema::hasColumn('purchase_items', 'product_name')) {
                    $updData['product_name'] = $pName;
                }
                if (Schema::hasColumn('purchase_items', 'product_sku')) {
                    $updData['product_sku'] = $pSku;
                }

                DB::table('purchase_items')->where('id', $pi->id)->update($updData);
            }
            $this->info("Updated " . count($purchaseItems) . " purchase items.");
        }

        if (Schema::hasTable('purchases')) {
            $purchases = DB::table('purchases')->get();
            foreach ($purchases as $pur) {
                $subtotal = DB::table('purchase_items')->where('purchase_id', $pur->id)->sum('subtotal');
                $discAmt = DB::table('purchase_items')->where('purchase_id', $pur->id)->sum('discount_amount');
                $taxAmt = DB::table('purchase_items')->where('purchase_id', $pur->id)->sum('tax_amount');
                $shipping = 15.00;
                $grandTotal = round($subtotal - $discAmt + $taxAmt + $shipping, 2);
                $paid = $pur->status === 'paid' || $pur->status === 'received' ? $grandTotal : round($grandTotal * 0.5, 2);
                $due = round($grandTotal - $paid, 2);

                DB::table('purchases')->where('id', $pur->id)->update([
                    'subtotal' => $subtotal,
                    'subtotal_base' => $subtotal,
                    'discount_amount' => $discAmt,
                    'discount_amount_base' => $discAmt,
                    'tax_amount' => $taxAmt,
                    'tax_amount_base' => $taxAmt,
                    'shipping_cost' => $shipping,
                    'shipping_cost_base' => $shipping,
                    'grand_total' => $grandTotal,
                    'grand_total_base' => $grandTotal,
                    'paid_amount' => $paid,
                    'paid_amount_base' => $paid,
                    'due_amount' => $due,
                    'due_amount_base' => $due,
                ]);
            }
            $this->info("Updated " . count($purchases) . " purchase orders.");
        }

        // 2. Purchase Return Items & Returns
        if (Schema::hasTable('purchase_return_items')) {
            $prItems = DB::table('purchase_return_items')->get();
            foreach ($prItems as $pri) {
                $cost = DB::table('products')->where('id', $pri->product_id)->value('cost_price') ?? 50.00;
                $total = round($cost * $pri->quantity, 2);
                DB::table('purchase_return_items')->where('id', $pri->id)->update([
                    'unit_cost' => $cost,
                    'unit_cost_base' => $cost,
                    'total' => $total,
                    'total_base' => $total,
                ]);
            }
        }
        if (Schema::hasTable('purchase_returns')) {
            $pReturns = DB::table('purchase_returns')->get();
            foreach ($pReturns as $pr) {
                $tot = DB::table('purchase_return_items')->where('purchase_return_id', $pr->id)->sum('total');
                DB::table('purchase_returns')->where('id', $pr->id)->update([
                    'total_amount' => $tot,
                    'total_amount_base' => $tot,
                ]);
            }
            $this->info("Updated purchase returns.");
        }

        // 3. Sale Items & Sales
        if (Schema::hasTable('sale_items')) {
            $saleItems = DB::table('sale_items')->get();
            foreach ($saleItems as $si) {
                $sell = DB::table('products')->where('id', $si->product_id)->value('selling_price') ?? 65.00;
                $qty = $si->quantity;
                $subtotal = round($sell * $qty, 2);
                $discPct = $si->discount_percent ?? 0;
                $discAmt = round($subtotal * ($discPct / 100), 2);
                $taxPct = $si->tax_percent ?? 0;
                $taxAmt = round(($subtotal - $discAmt) * ($taxPct / 100), 2);
                $total = round($subtotal - $discAmt + $taxAmt, 2);

                DB::table('sale_items')->where('id', $si->id)->update([
                    'unit_price' => $sell,
                    'subtotal' => $subtotal,
                    'discount_amount' => $discAmt,
                    'tax_amount' => $taxAmt,
                    'total' => $total,
                ]);
            }
            $this->info("Updated " . count($saleItems) . " sale items.");
        }

        if (Schema::hasTable('sales')) {
            $sales = DB::table('sales')->get();
            foreach ($sales as $s) {
                $subtotal = DB::table('sale_items')->where('sale_id', $s->id)->sum('subtotal');
                $discAmt = DB::table('sale_items')->where('sale_id', $s->id)->sum('discount_amount');
                $taxAmt = DB::table('sale_items')->where('sale_id', $s->id)->sum('tax_amount');
                $grandTotal = round($subtotal - $discAmt + $taxAmt, 2);
                $paid = $s->status === 'completed' ? $grandTotal : round($grandTotal * 0.5, 2);
                $change = $paid > $grandTotal ? round($paid - $grandTotal, 2) : 0.00;

                DB::table('sales')->where('id', $s->id)->update([
                    'subtotal' => $subtotal,
                    'discount_amount' => $discAmt,
                    'tax_amount' => $taxAmt,
                    'grand_total' => $grandTotal,
                    'paid_amount' => $paid,
                    'change_amount' => $change,
                ]);
            }
            $this->info("Updated " . count($sales) . " sales.");
        }

        // 4. Order Items & Orders (E-Commerce)
        if (Schema::hasTable('order_items')) {
            $orderItems = DB::table('order_items')->get();
            foreach ($orderItems as $oi) {
                $sell = DB::table('products')->where('id', $oi->product_id)->value('selling_price') ?? 65.00;
                $qty = $oi->quantity;
                $subtotal = round($sell * $qty, 2);
                $discAmt = $oi->discount_amount ?? 0.00;
                $taxAmt = $oi->tax_amount ?? 0.00;
                $total = round($subtotal - $discAmt + $taxAmt, 2);

                DB::table('order_items')->where('id', $oi->id)->update([
                    'unit_price' => $sell,
                    'subtotal' => $subtotal,
                    'total' => $total,
                ]);
            }
        }

        if (Schema::hasTable('orders')) {
            $orders = DB::table('orders')->get();
            foreach ($orders as $o) {
                $subtotal = DB::table('order_items')->where('order_id', $o->id)->sum('subtotal');
                $discAmt = DB::table('order_items')->where('order_id', $o->id)->sum('discount_amount');
                $taxAmt = DB::table('order_items')->where('order_id', $o->id)->sum('tax_amount');
                $shipping = $o->shipping_cost > 0 ? 10.00 : 0.00;
                $grandTotal = round($subtotal - $discAmt + $taxAmt + $shipping, 2);
                $paid = $o->status === 'completed' || $o->status === 'delivered' ? $grandTotal : round($grandTotal * 0.5, 2);

                DB::table('orders')->where('id', $o->id)->update([
                    'subtotal' => $subtotal,
                    'discount_amount' => $discAmt,
                    'tax_amount' => $taxAmt,
                    'shipping_cost' => $shipping,
                    'grand_total' => $grandTotal,
                    'paid_amount' => $paid,
                ]);
            }
            $this->info("Updated orders & order items.");
        }

        // 5. Inventory Movements unit_cost
        if (Schema::hasTable('inventory_movements')) {
            $movements = DB::table('inventory_movements')->get();
            foreach ($movements as $m) {
                $cost = DB::table('products')->where('id', $m->product_id)->value('cost_price') ?? 45.00;
                DB::table('inventory_movements')->where('id', $m->id)->update(['unit_cost' => $cost]);
            }
            $this->info("Updated " . count($movements) . " inventory movements unit cost.");
        }

        // 6. Employees & Payrolls basic_salary
        if (Schema::hasTable('employees')) {
            $employees = DB::table('employees')->get();
            foreach ($employees as $emp) {
                // Realistic monthly salary between $450 and $1,800
                $salary = round(450 + ($emp->id * 85) % 1350, 2);
                DB::table('employees')->where('id', $emp->id)->update(['basic_salary' => $salary]);

                // Update employee payrolls
                if (Schema::hasTable('payrolls')) {
                    $payrolls = DB::table('payrolls')->where('employee_id', $emp->id)->get();
                    foreach ($payrolls as $pr) {
                        $allowance = 50.00;
                        $otPay = round(($pr->overtime_hours ?? 0) * 10.00, 2);
                        $lateDed = $pr->late_deduction ?? 0.00;
                        $earlyDed = $pr->early_leave_deduction ?? 0.00;
                        $net = round($salary + $allowance + $otPay - $lateDed - $earlyDed, 2);

                        DB::table('payrolls')->where('id', $pr->id)->update([
                            'basic_salary' => $salary,
                            'allowances' => $allowance,
                            'overtime_pay' => $otPay,
                            'net_salary' => $net,
                        ]);
                    }
                }
            }
            $this->info("Updated salaries for employees and payrolls.");
        }

        // 7. Customers total_spent
        if (Schema::hasTable('customers')) {
            $customers = DB::table('customers')->get();
            foreach ($customers as $c) {
                $spent = DB::table('sales')->where('customer_id', $c->id)->where('status', 'completed')->sum('grand_total');
                $count = DB::table('sales')->where('customer_id', $c->id)->where('status', 'completed')->count();
                DB::table('customers')->where('id', $c->id)->update([
                    'total_spent' => round($spent, 2),
                    'order_count' => $count,
                ]);
            }
            $this->info("Recalculated customer total_spent and order_count.");
        }

        // 8. Cash Registers
        if (Schema::hasTable('cash_registers')) {
            $registers = DB::table('cash_registers')->get();
            foreach ($registers as $cr) {
                $openBal = 200.00;
                $closeBal = 450.00;
                $expectedBal = 450.00;
                DB::table('cash_registers')->where('id', $cr->id)->update([
                    'opening_balance' => $openBal,
                    'closing_balance' => $closeBal,
                    'expected_balance' => $expectedBal,
                ]);
            }
            $this->info("Updated cash register balances.");
        }
    }
}
