<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Controllers\Api\V1\Customer\Traits\FormatsStorefrontData;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Marketing\Banner;
use App\Models\Marketing\FlashSale;
use App\Models\Marketing\Coupon;
use App\Models\Review\ProductReview;
use App\Models\CMS\Blog;
use App\Models\Customer\Customer;
use App\Models\Order\Order;
use App\Models\Setting\Province;
use App\Models\Payment\PaymentMethod;
use App\Models\Shipping\ShippingMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HomeController extends BaseApiController
{
    use FormatsStorefrontData;

    // ─── GET /api/v1/customer/homepage ───────────────────────────────────────

    public function homepage(Request $request): JsonResponse
    {
        $cachedCatalog = Cache::remember('storefront_homepage_v2', 120, function () {
            return [
                'announcement'       => $this->getAnnouncement(),
                'hero_banners'       => $this->getBanners(),
                'spotlight_banners'  => $this->getSpotlightBanners(4),
                'quick_categories'   => $this->getTopCategories(10),
                'flash_sale'         => $this->getActiveFlashSale(),
                'featured_products'  => $this->getFeaturedProducts(12),
                'best_sellers'       => $this->getBestSellers(12),
                'popular_products'   => $this->getPopularProducts(12),
                'new_arrivals'       => $this->getNewArrivals(12),
                'today_deals'        => $this->getTodayDeals(12),
                'top_brands'         => $this->getTopBrands(10),
                'coupons'            => $this->getActiveCoupons(6),
                'category_showcase'  => $this->getCategoryShowcase(4),
                'top_rated_products' => $this->getTopRatedProducts(12),
                'testimonials'       => $this->getTestimonials(6),
                'blog_posts'         => $this->getBlogPreview(3),
                'store_info'         => $this->getStoreSettings(),
                'stats'              => $this->getStoreStats(),
            ];
        });

        $recommendations = $this->getRecommendations($request, 12);

        $response = array_merge($cachedCatalog, [
            'recommendations' => $recommendations,
            // Backwards compatibility keys
            'banners'         => $cachedCatalog['hero_banners'],
            'top_categories'  => $cachedCatalog['quick_categories'],
            'blog_preview'    => $cachedCatalog['blog_posts'],
        ]);

        return $this->successResponse($response);
    }

    // ─── GET /api/v1/customer/featured ───────────────────────────────────────

    public function featured(Request $request): JsonResponse
    {
        $type  = $request->input('type', 'featured');
        $limit = (int) $request->input('limit', 12);

        $products = match ($type) {
            'best_sellers' => $this->getBestSellers($limit),
            'popular'      => $this->getPopularProducts($limit),
            'new_arrivals' => $this->getNewArrivals($limit),
            'deals'        => $this->getTodayDeals($limit),
            'top_rated'    => $this->getTopRatedProducts($limit),
            default        => $this->getFeaturedProducts($limit),
        };

        return $this->successResponse($products);
    }

    // ─── GET /api/v1/customer/banners ────────────────────────────────────────

    public function banners(): JsonResponse
    {
        return $this->successResponse($this->getBanners());
    }

    // ─── GET /api/v1/customer/settings ───────────────────────────────────────

    public function settings(): JsonResponse
    {
        return $this->successResponse($this->getStoreSettings());
    }

    // ─── GET /api/v1/customer/payment-methods ─────────────────────────────────

    public function paymentMethods(): JsonResponse
    {
        try {
            $methods = PaymentMethod::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'code', 'type', 'logo', 'instructions', 'config']);

            if ($methods->isEmpty()) {
                return $this->successResponse([
                    ['id' => 1, 'name' => 'Cash on Delivery (COD)', 'code' => 'cod', 'type' => 'manual', 'logo' => null, 'instructions' => 'Pay cash upon delivery at your doorstep.'],
                    ['id' => 2, 'name' => 'Bakong / KHQR PromptPay', 'code' => 'khqr', 'type' => 'qr', 'logo' => null, 'instructions' => 'Scan with any Cambodian banking app (ABA, Wing, ACLEDA, etc.)'],
                    ['id' => 3, 'name' => 'ABA PAY Instant', 'code' => 'aba', 'type' => 'gateway', 'logo' => null, 'instructions' => 'Direct payment with ABA Mobile app.'],
                ]);
            }

            return $this->successResponse($methods);
        } catch (\Throwable) {
            return $this->successResponse([]);
        }
    }

    // ─── GET /api/v1/customer/shipping-methods ────────────────────────────────

    public function shippingMethods(): JsonResponse
    {
        try {
            $methods = ShippingMethod::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'code', 'cost', 'estimated_days', 'description']);

            if ($methods->isEmpty()) {
                return $this->successResponse([
                    ['id' => 1, 'name' => 'Standard Delivery (Phnom Penh)', 'code' => 'standard_pp', 'cost' => 1.50, 'estimated_days' => '1-2 Days', 'description' => 'Fast delivery inside Phnom Penh'],
                    ['id' => 2, 'name' => 'Express Same-Day', 'code' => 'express', 'cost' => 3.00, 'estimated_days' => 'Within 3 Hours', 'description' => 'Same-day instant rider delivery (Phnom Penh)'],
                    ['id' => 3, 'name' => 'Provincial Express Delivery (25 Provinces)', 'code' => 'provinces', 'cost' => 2.50, 'estimated_days' => '1-3 Days', 'description' => 'Reliable courier delivery across all 25 provinces in Cambodia via J&T / Virak Buntham'],
                    ['id' => 4, 'name' => 'Free Store Pickup (AEON / Branch)', 'code' => 'pickup', 'cost' => 0.00, 'estimated_days' => 'Ready in 30 Mins', 'description' => 'Pick up at nearest outlet or warehouse'],
                ]);
            }

            return $this->successResponse($methods);
        } catch (\Throwable) {
            return $this->successResponse([]);
        }
    }

    // ─── GET /api/v1/customer/provinces ───────────────────────────────────────

    public function provinces(): JsonResponse
    {
        try {
            $provinces = Province::where('is_active', true)
                ->orderBy('name')
                ->with(['cities' => fn($q) => $q->where('is_active', true)->orderBy('name')])
                ->get(['id', 'name', 'code', 'country_id']);

            return $this->successResponse($provinces);
        } catch (\Throwable) {
            return $this->successResponse([]);
        }
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function getAnnouncement(): array
    {
        $activeAnnouncement = \App\Models\CMS\Announcement::active()
            ->orderByDesc('sort_order')
            ->orderByDesc('id')
            ->first();

        if ($activeAnnouncement) {
            return [
                'id'          => $activeAnnouncement->id,
                'enabled'     => (bool) $activeAnnouncement->is_active,
                'title'       => $activeAnnouncement->title,
                'message'     => $activeAnnouncement->message_en ?: $activeAnnouncement->message_km,
                'message_km'  => $activeAnnouncement->message_km,
                'link'        => $activeAnnouncement->link_url ?: '/promotions',
                'code'        => $activeAnnouncement->coupon_code,
                'coupon_code' => $activeAnnouncement->coupon_code,
                'bg_gradient' => $activeAnnouncement->bg_gradient ?: 'from-indigo-600 to-purple-700',
                'badge_text'  => $activeAnnouncement->badge_text ?: 'SPECIAL PROMO',
            ];
        }

        $raw = DB::table('settings')->where('key', 'announcement_bar')->value('value');
        if ($raw) {
            $data = is_array($raw) ? $raw : json_decode($raw, true);
            if (is_array($data)) {
                return [
                    'enabled'     => (bool)($data['enabled'] ?? true),
                    'message'     => $data['message'] ?? ($data['message_km'] ?? ''),
                    'message_km'  => $data['message_km'] ?? ($data['message'] ?? ''),
                    'link'        => $data['link'] ?? '/promotions',
                    'code'        => $data['coupon_code'] ?? ($data['code'] ?? ''),
                    'bg_gradient' => $data['bg_gradient'] ?? 'from-indigo-600 to-purple-700',
                    'badge_text'  => $data['badge_text'] ?? 'SPECIAL PROMO',
                ];
            }
        }

        $settings = $this->getStoreSettings();
        return [
            'enabled'     => true,
            'message'     => $settings['announcement_text'] ?? '⚡ Free Express Shipping on orders over $50',
            'message_km'  => '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំង ២៥ រាជធានី-ខេត្ត សម្រាប់ការកុម្ម៉ង់ចាប់ពី $50 ឡើងទៅ!',
            'link'        => '/products?sort=deals',
            'code'        => 'FREESHIP50',
            'bg_gradient' => 'from-indigo-600 to-purple-700',
            'badge_text'  => 'SPECIAL PROMO',
        ];
    }

    private function getBanners(): array
    {
        try {
            $gradients = [
                'from-[#4a0b27]/95 via-[#2b0616]/85 via-50% to-transparent',
                'from-[#0f1130]/95 via-[#090b20]/85 via-50% to-transparent',
                'from-[#06203d]/95 via-[#031326]/85 via-50% to-transparent',
                'from-[#0e243d]/95 via-[#071524]/85 via-50% to-transparent',
                'from-[#2d0d2e]/95 via-[#1a071b]/85 via-50% to-transparent',
            ];
            $badges = ['AEON ONLINE TECH', 'OFFICIAL ESPORTS GEAR', 'HI-RES AUDIOPHILE', 'ENTERPRISE SOLUTION', 'PRE-ORDER NOW'];
            $discounts = ['បញ្ចុះតម្លៃ $300', 'បញ្ចុះតម្លៃ 35%', 'តម្លៃចាប់ពី $99', 'ធានារយៈពេល ២ ឆ្នាំ', 'ថែមជូនកាដូ $120'];

            $banners = Banner::active()
                ->where(function ($q) {
                    $q->where('position', 'hero')->orWhereNull('position');
                })
                ->orderBy('sort_order')
                ->limit(8)
                ->get()
                ->values()
                ->map(fn($b, $idx) => [
                    'id'             => $b->id,
                    'title'          => $b->title,
                    'subtitle'       => $b->subtitle,
                    'image'          => $b->image_url ?? $b->image,
                    'mobile_image'   => $b->mobile_image ?? $b->image_url ?? $b->image,
                    'link'           => $b->link_url ?? $b->link ?? '/products',
                    'button_text'    => $b->button_text ?? 'ទិញឥឡូវនេះ',
                    'type'           => $b->type ?? 'hero',
                    'position'       => $b->position ?? 'hero',
                    'badge'          => $b->badge ?? $badges[$idx % count($badges)],
                    'discount_tag'   => $b->discount_tag ?? $discounts[$idx % count($discounts)],
                    'theme_gradient' => $b->theme_gradient ?? $gradients[$idx % count($gradients)],
                ])
                ->toArray();

            return $banners ?: [];
        } catch (\Throwable) {
            return [];
        }
    }

    private function getSpotlightBanners(int $limit = 4): array
    {
        try {
            return Banner::active()
                ->whereIn('position', ['sidebar', 'spotlight', 'footer', 'popup'])
                ->orderBy('sort_order')
                ->limit($limit)
                ->get()
                ->map(fn($b) => [
                    'id'          => $b->id,
                    'title'       => $b->title,
                    'subtitle'    => $b->subtitle,
                    'image'       => $b->image_url ?? $b->image,
                    'mobile_image'=> $b->mobile_image ?? $b->image_url ?? $b->image,
                    'link'        => $b->link_url ?? $b->link ?? '/products',
                    'button_text' => $b->button_text ?? 'Shop Now',
                    'position'    => $b->position ?? 'sidebar',
                ])
                ->toArray();
        } catch (\Throwable) {
            return [];
        }
    }

    private function getActiveFlashSale(): ?array
    {
        try {
            $sale = FlashSale::where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
                })
                ->with(['items.product.primaryImage', 'items.product.category', 'items.product.brand'])
                ->first();

            if (!$sale || $sale->items->isEmpty()) {
                $fallbackSale = FlashSale::first();
                $products = Product::active()->whereNotNull('compare_price')
                    ->whereColumn('selling_price', '<', 'compare_price')
                    ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
                    ->limit(4)
                    ->get();

                if ($products->isNotEmpty()) {
                    return [
                        'id'         => $fallbackSale?->id ?? 1,
                        'name'       => $fallbackSale?->name ?? 'Limited-Time Flash Deals',
                        'ends_at'    => now()->addDays(2)->toISOString(),
                        'products'   => $products->map(fn($p) => $this->formatProduct($p, [
                            'flash_price'  => (float) $p->selling_price,
                            'discount_pct' => $p->discount_percent_attribute ?? 20,
                            'quota'        => 50,
                            'sold_count'   => 28,
                        ]))->toArray(),
                    ];
                }
                return null;
            }

            return [
                'id'       => $sale->id,
                'name'     => $sale->name,
                'ends_at'  => ($sale->ends_at ?? now()->addDays(2))->toISOString(),
                'products' => $sale->items->map(function ($item) {
                    if (!$item->product) return null;
                    return $this->formatProduct($item->product, [
                        'flash_price'  => (float) ($item->flash_price ?: $item->product->selling_price),
                        'discount_pct' => (float) ($item->discount_percent ?: $item->product->discount_percent_attribute ?: 25),
                        'quota'        => (int) ($item->quota ?: 50),
                        'sold_count'   => (int) ($item->sold_count ?: 12),
                    ]);
                })->filter()->values()->toArray(),
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function getFeaturedProducts(int $limit): array
    {
        return Product::active()
            ->featured()
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p))
            ->toArray();
    }

    private function getBestSellers(int $limit): array
    {
        $topIds = DB::table('sale_items')
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->pluck('product_id');

        if ($topIds->isNotEmpty()) {
            return Product::active()
                ->whereIn('id', $topIds)
                ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
                ->get()
                ->map(fn($p) => $this->formatProduct($p))
                ->toArray();
        }

        return Product::active()
            ->orderByDesc('sold_count')
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p))
            ->toArray();
    }

    private function getPopularProducts(int $limit): array
    {
        return Product::active()
            ->orderByDesc('view_count')
            ->orderByDesc('sold_count')
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p))
            ->toArray();
    }

    private function getNewArrivals(int $limit): array
    {
        return Product::active()
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p))
            ->toArray();
    }

    private function getTodayDeals(int $limit): array
    {
        return Product::active()
            ->whereNotNull('compare_price')
            ->whereColumn('selling_price', '<', 'compare_price')
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->orderByRaw('((compare_price - selling_price) / compare_price) DESC')
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p))
            ->toArray();
    }

    private function getTopRatedProducts(int $limit): array
    {
        return Product::active()
            ->orderByDesc('rating_avg')
            ->orderByDesc('rating_count')
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p))
            ->toArray();
    }

    private function getTopCategories(int $limit): array
    {
        return Category::active()
            ->withCount(['products' => fn($q) => $q->active()])
            ->orderByDesc('products_count')
            ->limit($limit)
            ->get()
            ->map(fn($c) => $this->formatCategory($c, false))
            ->toArray();
    }

    private function getCategoryShowcase(int $limit): array
    {
        $categories = Category::active()
            ->whereHas('products', fn($q) => $q->active())
            ->withCount(['products' => fn($q) => $q->active()])
            ->orderByDesc('products_count')
            ->limit($limit)
            ->get();

        return $categories->map(function ($cat) {
            $products = Product::active()
                ->where('category_id', $cat->id)
                ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
                ->limit(4)
                ->get()
                ->map(fn($p) => $this->formatProduct($p));

            return [
                'id'            => $cat->id,
                'name'          => $cat->name,
                'slug'          => $cat->slug,
                'image'         => $cat->image_url ?? $cat->image,
                'description'   => $cat->description,
                'product_count' => $cat->products_count,
                'products'      => $products,
            ];
        })->toArray();
    }

    private function getTopBrands(int $limit): array
    {
        return Brand::active()
            ->withCount(['products' => fn($q) => $q->active()])
            ->orderByDesc('products_count')
            ->limit($limit)
            ->get()
            ->map(fn($b) => [
                'id'            => $b->id,
                'name'          => $b->name,
                'slug'          => $b->slug,
                'logo'          => $b->logo_url ?? $b->logo,
                'product_count' => $b->products_count,
            ])
            ->toArray();
    }

    private function getActiveCoupons(int $limit): array
    {
        try {
            return Coupon::active()
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                })
                ->orderByDesc('value')
                ->limit($limit)
                ->get()
                ->map(fn($c) => [
                    'id'           => $c->id,
                    'code'         => $c->code,
                    'name'         => $c->name,
                    'type'         => $c->type,
                    'value'        => (float) $c->value,
                    'min_purchase' => (float) $c->min_purchase,
                    'max_discount' => (float) $c->max_discount,
                    'expires_at'   => $c->expires_at?->toISOString(),
                ])
                ->toArray();
        } catch (\Throwable) {
            return [];
        }
    }

    private function getRecommendations(Request $request, int $limit): array
    {
        if ($user = $request->user()) {
            $customer = Customer::where('user_id', $user->id)->first();
            if ($customer) {
                $favCategoryIds = DB::table('orders')
                    ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                    ->join('products', 'order_items.product_id', '=', 'products.id')
                    ->where('orders.customer_id', $customer->id)
                    ->pluck('products.category_id')
                    ->filter()
                    ->unique();

                if ($favCategoryIds->isNotEmpty()) {
                    $recommended = Product::active()
                        ->whereIn('category_id', $favCategoryIds)
                        ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
                        ->orderByDesc('rating_avg')
                        ->limit($limit)
                        ->get()
                        ->map(fn($p) => $this->formatProduct($p));

                    if ($recommended->isNotEmpty()) {
                        return $recommended->toArray();
                    }
                }
            }
        }

        return Product::active()
            ->where('rating_avg', '>=', 4.0)
            ->orderByDesc('sold_count')
            ->orderByDesc('rating_avg')
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p))
            ->toArray();
    }

    private function getTestimonials(int $limit): array
    {
        try {
            return ProductReview::where('status', 'approved')
                ->where('rating', '>=', 4)
                ->with(['product:id,name,slug', 'customer:id,name,photo'])
                ->latest()
                ->limit($limit)
                ->get()
                ->map(fn($r) => [
                    'id'           => $r->id,
                    'name'         => $r->name ?: ($r->customer?->name ?? 'Satisfied Customer'),
                    'avatar'       => $r->customer?->photo,
                    'rating'       => (int) $r->rating,
                    'title'        => $r->title ?: 'Exceptional Experience',
                    'body'         => $r->body,
                    'is_verified'  => (bool) $r->is_verified_purchase,
                    'product_name' => $r->product?->name,
                    'product_slug' => $r->product?->slug,
                    'created_at'   => $r->created_at?->toISOString(),
                ])
                ->toArray();
        } catch (\Throwable) {
            return [];
        }
    }

    private function getBlogPreview(int $limit): array
    {
        try {
            return Blog::where('status', 'published')
                ->with('category')
                ->orderBy('published_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(fn($b) => [
                    'id'           => $b->id,
                    'title'        => $b->title,
                    'slug'         => $b->slug,
                    'excerpt'      => $b->excerpt,
                    'thumbnail'    => $b->thumbnail,
                    'category'     => $b->category?->name,
                    'published_at' => $b->published_at?->toISOString(),
                ])
                ->toArray();
        } catch (\Throwable) {
            return [];
        }
    }

    private function getStoreSettings(): array
    {
        return Cache::remember('storefront_settings_v5', 15, function () {
            $settings = DB::table('settings')->pluck('value', 'key')->toArray();
            $company = DB::table('companies')->first();

            $siteName = $settings['site_name'] ?? $company?->name ?? 'NexTech Enterprise';
            $siteLogo = $settings['site_logo'] ?? $settings['logo_light'] ?? $company?->logo ?? null;
            if ($siteLogo && !str_starts_with($siteLogo, 'http')) {
                $siteLogo = url(ltrim($siteLogo, '/'));
            }

            $favicon = $settings['favicon'] ?? null;
            if ($favicon && !str_starts_with($favicon, 'http')) {
                $favicon = url(ltrim($favicon, '/'));
            }

            $siteSubtitle = $settings['site_subtitle'] ?? 'Tech Store & POS';
            $siteEmail = $settings['site_email'] ?? $company?->email ?? 'tbongkhmum@enterprise-pos.com';
            $companyPhone = $settings['company_phone'] ?? $company?->phone ?? '+855 71 888 999';
            $companyAddress = $settings['company_address'] ?? $company?->address ?? 'ក្រុងសួង, ខេត្តត្បូងឃ្មុំ, ព្រះរាជាណាចក្រកម្ពុជា';
            $rawAnnouncement = DB::table('settings')->where('key', 'announcement_bar')->value('value');
            $announcementConfig = null;
            if ($rawAnnouncement) {
                $announcementConfig = is_array($rawAnnouncement) ? $rawAnnouncement : json_decode($rawAnnouncement, true);
            }
            $announcement = $announcementConfig['message'] ?? ($settings['announcement_text'] ?? ($settings['pos_receipt_header'] ?? '⚡ Free express shipping across Cambodia on orders over $50.'));

            return [
                'site_name'         => $siteName,
                'site_subtitle'     => $siteSubtitle,
                'site_email'        => $siteEmail,
                'site_logo'         => $siteLogo,
                'favicon'           => $favicon,
                'company_phone'     => $companyPhone,
                'hotlines'          => [$companyPhone, '012 220 152', '071 5777 378'],
                'delivery_headline' => 'Delivery within 1 hour / Delivery 25 Provinces',
                'store_hours'       => 'Mon - Sun: 8:00 AM - 8:00 PM',
                'company_address'   => $companyAddress,
                'currency_base'     => $settings['currency_base'] ?? 'USD',
                'announcement_text' => $announcement,
                'announcement_bar'  => $announcementConfig ?: [
                    'enabled'     => true,
                    'message'     => $announcement,
                    'message_km'  => '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំង ២៥ រាជធានី-ខេត្ត សម្រាប់ការកុម្ម៉ង់ចាប់ពី $50 ឡើងទៅ!',
                    'link'        => '/promotions',
                    'coupon_code' => 'OPTAPOS2026',
                    'bg_gradient' => 'from-indigo-600 to-purple-700',
                    'badge_text'  => 'SPECIAL PROMO',
                ],
                'socials'           => [
                    'facebook'  => $settings['social_facebook'] ?? 'https://facebook.com',
                    'telegram'  => $settings['social_telegram'] ?? 'https://t.me',
                    'tiktok'    => $settings['social_tiktok'] ?? 'https://tiktok.com',
                    'youtube'   => $settings['social_youtube'] ?? 'https://youtube.com',
                    'instagram' => $settings['social_instagram'] ?? 'https://instagram.com',
                ],
            ];
        });
    }

    private function getStoreStats(): array
    {
        return Cache::remember('storefront_stats_v2', 3600, function () {
            return [
                'products'  => Product::active()->count(),
                'brands'    => Brand::active()->count(),
                'customers' => Customer::active()->count(),
                'orders'    => Order::whereIn('status', ['completed', 'delivered'])->count(),
            ];
        });
    }
}
