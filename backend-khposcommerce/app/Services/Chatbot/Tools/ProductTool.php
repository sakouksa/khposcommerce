<?php

namespace App\Services\Chatbot\Tools;

use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Inventory\Inventory;
use Illuminate\Support\Facades\Log;

class ProductTool
{
    /**
     * Multilingual synonym map for e-commerce search expansion.
     */
    private const MULTILINGUAL_SYNONYMS = [
        // Laptops & Computers
        'កុំព្យូទ័រ'   => ['laptop', 'computer', 'notebook', 'pc', 'macbook', 'cyborg', 'ideapad', 'thinkpad', 'dell', 'asus', 'acer', 'hp', 'msi', 'lenovo'],
        'កុំព្យូទ័រយួរដៃ' => ['laptop', 'notebook', 'macbook', 'cyborg', 'ideapad'],
        'ឡេបថប'      => ['laptop', 'notebook', 'macbook', 'cyborg', 'ideapad'],
        'โน้ตบุ๊ก'     => ['laptop', 'notebook', 'computer'],
        'คอมพิวเตอร์'   => ['computer', 'pc', 'laptop'],
        'máy tính'    => ['laptop', 'computer', 'pc'],
        'laptop'      => ['laptop', 'notebook', 'computer'],
        '电脑'        => ['computer', 'laptop', 'pc'],
        '笔记本'      => ['laptop', 'notebook'],

        // Phones & Smartphones
        'ទូរស័ព្ទ'     => ['phone', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'mobile'],
        'ទូរស័ព្ទដៃ'   => ['phone', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'mobile'],
        'ស្មាតហ្វូន'    => ['smartphone', 'phone', 'iphone', 'android', 'mobile'],
        'ស្មាតហ្វូន 5G' => ['smartphone', '5g', 'phone'],
        'โทรศัพท์'     => ['phone', 'smartphone', 'mobile'],
        'điện thoại'  => ['phone', 'smartphone', 'mobile'],
        'phone'       => ['phone', 'smartphone', 'mobile'],
        '手机'        => ['phone', 'smartphone', 'mobile'],

        // Chargers & Cables & Power Banks
        'ឆ្នាំងសាក'    => ['charger', 'charging', 'power bank', 'adapter', 'cable', 'fast charger'],
        'ខ្សែសាក'     => ['cable', 'charger', 'type-c', 'lightning', 'usb'],
        'ដុំសាក'      => ['charger', 'adapter', 'power'],
        'ក្បាលសាក'    => ['charger', 'adapter'],
        'ថ្មជំនួយ'     => ['power bank', 'battery', 'charger'],
        'charger'     => ['charger', 'adapter', 'cable', 'power bank'],
        'power bank'  => ['power bank', 'battery', 'charger'],
        'ที่ชาร์จ'     => ['charger', 'power bank', 'cable'],
        'sạc'         => ['charger', 'cable', 'power bank'],
        '充电器'      => ['charger', 'power bank', 'cable'],

        // Gaming
        'ហ្គេម'        => ['gaming', 'game', 'rtx', 'geforce', 'cyborg'],
        'ល្បែង'       => ['gaming', 'game'],
        'เกม'         => ['gaming', 'game'],
        'chơi game'   => ['gaming', 'game'],
        'gaming'      => ['gaming', 'game', 'rtx'],
        '游戏'        => ['gaming', 'game'],

        // Audio & Headphones
        'កាស'         => ['audio', 'earphone', 'headphone', 'airpods', 'buds', 'speaker', 'sound'],
        'កាសត្រចៀក'   => ['audio', 'earphone', 'headphone', 'airpods', 'buds'],
        'កាសប៊្លូធូស'   => ['audio', 'earphone', 'bluetooth', 'airpods', 'buds'],
        'បាស'         => ['speaker', 'audio', 'sound'],
        'ឧបករណ៍បំពងសំឡេង' => ['speaker', 'audio'],
        'หูฟัง'        => ['audio', 'headphone', 'earphone', 'buds'],
        'tai nghe'    => ['audio', 'headphone', 'earphone'],
        'audio'       => ['audio', 'headphone', 'speaker', 'earphone'],
        '耳机'        => ['headphone', 'earphone', 'audio'],
        '音箱'        => ['speaker', 'audio'],

        // Watches & Wearables
        'នាឡិកា'      => ['watch', 'smartwatch', 'band'],
        'នាឡិកាឆ្លាតវៃ' => ['smartwatch', 'watch', 'band'],
        'នាឡិកាដៃ'    => ['watch', 'smartwatch'],
        'นาฬิกา'      => ['watch', 'smartwatch'],
        'đồng hồ'     => ['watch', 'smartwatch'],
        'watch'       => ['watch', 'smartwatch'],
        '手表'        => ['watch', 'smartwatch'],

        // Monitors & Displays
        'ម៉ូនីទ័រ'      => ['monitor', 'display', 'screen'],
        'អេក្រង់'      => ['monitor', 'display', 'screen'],
        'កញ្ចក់'      => ['monitor', 'display', 'screen'],
        'monitor'     => ['monitor', 'display', 'screen'],
        'จอภาพ'       => ['monitor', 'display'],
        'màn hình'    => ['monitor', 'display'],
        '显示器'      => ['monitor', 'display'],

        // Keyboards & Mice
        'ក្ដារចុច'      => ['keyboard', 'keyboards'],
        'ឃីប៊ត'       => ['keyboard'],
        'ម៉ៅស៍'       => ['mouse', 'mice'],
        'ម៉ៅ'         => ['mouse'],
        'keyboard'    => ['keyboard'],
        'mouse'       => ['mouse'],

        // Cameras & Photography
        'កាមេរ៉ា'      => ['camera', 'photography', 'lens'],
        'ថតរូប'       => ['camera', 'photography'],
        'camera'      => ['camera', 'photography'],
        'กล้อง'       => ['camera'],
        'máy ảnh'     => ['camera'],
        '相机'        => ['camera'],

        // Network & 5G Routers
        'រ៉ោតទ័រ'      => ['router', 'wifi', 'modem', '5g', 'network'],
        'រ៉ោតទ័រ 5G'   => ['router', '5g', 'wifi'],
        'router'      => ['router', 'wifi', '5g'],
        '路由器'      => ['router', 'wifi'],

        // Shoes & Footwear
        'ស្បែកជើង'    => ['shoe', 'shoes', 'footwear'],
        'shoe'        => ['shoe', 'shoes', 'footwear'],
    ];

    /**
     * Search products by keyword, category, brand, or price filters.
     */
    public function searchProducts(array $params): array
    {
        $query = Product::query()
            ->active()
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'variants.inventories', 'inventories']);

        $searchTerm = trim($params['query'] ?? '');
        $expandedTerms = $this->expandSearchTerms($searchTerm);

        // Check if query is looking for deals/discounts
        if ($this->isDiscountIntent($searchTerm)) {
            $query->where(function ($q) {
                $q->whereNotNull('compare_price')
                  ->whereRaw('compare_price > selling_price')
                  ->orWhere('is_featured', true);
            });
        } elseif (!empty($searchTerm)) {
            $query->where(function ($q) use ($searchTerm, $expandedTerms) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$searchTerm}%"))
                  ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', "%{$searchTerm}%"));

                foreach ($expandedTerms as $term) {
                    $q->orWhere('name', 'like', "%{$term}%")
                      ->orWhere('description', 'like', "%{$term}%")
                      ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$term}%")->orWhere('slug', 'like', "%{$term}%"))
                      ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', "%{$term}%"));
                }
            });
        }

        if (!empty($params['category'])) {
            $cat = trim($params['category']);
            $query->whereHas('category', fn ($c) => $c->where('name', 'like', "%{$cat}%")->orWhere('slug', $cat));
        }

        if (!empty($params['brand'])) {
            $brand = trim($params['brand']);
            $query->whereHas('brand', fn ($b) => $b->where('name', 'like', "%{$brand}%")->orWhere('slug', $brand));
        }

        if (isset($params['min_price']) && is_numeric($params['min_price'])) {
            $query->where('selling_price', '>=', (float) $params['min_price']);
        }

        if (isset($params['max_price']) && is_numeric($params['max_price'])) {
            $query->where('selling_price', '<=', (float) $params['max_price']);
        }

        if (!empty($params['in_stock_only'])) {
            $query->where(function ($q) {
                $q->where('track_inventory', false)
                  ->orWhereHas('inventories', fn ($inv) => $inv->where('quantity', '>', 0))
                  ->orWhereHas('variants.inventories', fn ($inv) => $inv->where('quantity', '>', 0));
            });
        }

        $limit = min((int) ($params['limit'] ?? 6), 12);
        $products = $query->limit($limit)->get();

        return [
            'count'    => $products->count(),
            'products' => $products->map(fn ($p) => $this->formatProductSummary($p))->toArray(),
        ];
    }

    /**
     * Get detailed product information.
     */
    public function getProductDetails(array $params): array
    {
        $id = $params['product_id'] ?? null;
        $slug = $params['slug'] ?? null;

        $product = Product::query()
            ->active()
            ->with(['category', 'brand', 'unit', 'images', 'variants.inventories', 'inventories', 'reviews'])
            ->when($id, fn ($q) => $q->where('id', $id))
            ->when(!$id && $slug, fn ($q) => $q->where('slug', $slug))
            ->first();

        if (!$product) {
            return [
                'found'   => false,
                'message' => 'Product not found or currently unavailable.',
            ];
        }

        return [
            'found'   => true,
            'product' => [
                'id'                => $product->id,
                'name'              => $product->name,
                'slug'              => $product->slug,
                'sku'               => $product->sku,
                'barcode'           => $product->barcode,
                'price'             => (float) $product->selling_price,
                'compare_price'     => (float) $product->compare_price,
                'currency'          => 'USD',
                'description'       => strip_tags($product->description ?? $product->short_description ?? ''),
                'category'          => $product->category?->name,
                'brand'             => $product->brand?->name,
                'stock'             => (float) $product->stock,
                'is_in_stock'       => !$product->track_inventory || $product->stock > 0,
                'image_url'         => $product->primaryImage?->url ?? $product->images->first()?->url ?? null,
                'rating_avg'        => (float) ($product->rating_avg ?? 5.0),
                'reviews_count'     => $product->reviews->count(),
                'has_variants'      => (bool) $product->has_variants,
                'variants'          => $product->variants->map(fn ($v) => [
                    'id'            => $v->id,
                    'name'          => $v->name,
                    'sku'           => $v->sku,
                    'price'         => (float) ($v->selling_price ?? $product->selling_price),
                    'stock'         => (float) ($v->stock ?? 0),
                ])->toArray(),
            ],
        ];
    }

    /**
     * Check product stock.
     */
    public function checkProductStock(array $params): array
    {
        $productId = $params['product_id'] ?? null;
        $identifier = $params['identifier'] ?? $productId;

        $product = null;
        if (is_numeric($identifier)) {
            $product = Product::active()->find($identifier);
        }

        if (!$product && !empty($identifier)) {
            $product = Product::active()
                ->where(function ($q) use ($identifier) {
                    $q->where('sku', $identifier)
                      ->orWhere('slug', $identifier)
                      ->orWhere('name', 'like', "%{$identifier}%");
                })
                ->first();
        }

        if (!$product) {
            return ['found' => false, 'message' => 'Product not found.'];
        }

        if (!$product->track_inventory) {
            return [
                'found'        => true,
                'product_id'   => $product->id,
                'name'         => $product->name,
                'in_stock'     => true,
                'stock'        => 'Unlimited',
                'stock_status' => 'In Stock',
            ];
        }

        $stock = (float) $product->stock;
        return [
            'found'        => true,
            'product_id'   => $product->id,
            'name'         => $product->name,
            'in_stock'     => $stock > 0,
            'stock'        => $stock,
            'low_stock'    => $stock <= ($product->low_stock_threshold ?? 5),
        ];
    }

    /**
     * Recommend products (e.g., best sellers, deals, featured, related).
     */
    public function recommendProducts(array $params): array
    {
        $type = $params['type'] ?? 'featured';
        $limit = min((int) ($params['limit'] ?? 4), 8);

        $query = Product::query()
            ->active()
            ->with(['category:id,name', 'brand:id,name', 'primaryImage', 'inventories', 'variants.inventories']);

        if ($type === 'featured' || $type === 'popular') {
            $query->where('is_featured', true);
        } elseif ($type === 'deals') {
            $query->where(function ($q) {
                $q->whereNotNull('compare_price')
                  ->whereRaw('compare_price > selling_price')
                  ->orWhere('is_featured', true);
            });
        } elseif (!empty($params['category_id'])) {
            $query->where('category_id', $params['category_id']);
        }

        $products = $query->latest()->limit($limit)->get();

        // Fallback if 0 found for specific criteria
        if ($products->isEmpty()) {
            $products = Product::active()
                ->with(['category:id,name', 'brand:id,name', 'primaryImage'])
                ->latest()
                ->limit($limit)
                ->get();
        }

        return [
            'type'     => $type,
            'products' => $products->map(fn ($p) => $this->formatProductSummary($p))->toArray(),
        ];
    }

    /**
     * Compare two or more products.
     */
    public function compareProducts(array $params): array
    {
        $productIds = $params['product_ids'] ?? [];
        if (empty($productIds)) {
            return ['found' => false, 'message' => 'Please provide product IDs to compare.'];
        }

        $products = Product::active()
            ->whereIn('id', $productIds)
            ->with(['category:id,name', 'brand:id,name', 'primaryImage'])
            ->get();

        return [
            'comparison' => $products->map(fn ($p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'price'         => (float) $p->selling_price,
                'category'      => $p->category?->name,
                'brand'         => $p->brand?->name,
                'stock'         => (float) $p->stock,
                'image_url'     => $p->primaryImage?->url,
            ])->toArray(),
        ];
    }

    /**
     * Expand multilingual search terms into English catalog synonyms.
     */
    private function expandSearchTerms(string $term): array
    {
        if (empty($term)) {
            return [];
        }

        $lower = mb_strtolower($term);
        $results = [];

        foreach (self::MULTILINGUAL_SYNONYMS as $keyword => $synonyms) {
            if (str_contains($lower, mb_strtolower($keyword))) {
                $results = array_merge($results, $synonyms);
            }
        }

        return array_unique($results);
    }

    /**
     * Detect if the search term expresses discount or deal intent.
     */
    private function isDiscountIntent(string $term): bool
    {
        $lower = mb_strtolower($term);
        $discountKeywords = [
            'បញ្ចុះតម្លៃ', 'ប្រូម៉ូសិន', 'ការបញ្ចុះតម្លៃ', 'ការផ្តល់ជូនពិសេស', 'ថោក',
            'ลดราคา', 'โปรโมชั่น', 'ส่วนลด',
            'giảm giá', 'khuyến mãi', 'ưu đãi',
            '打折', '促销', '特惠', '优惠', '特价',
            'deal', 'discount', 'sale', 'promo', 'offer', 'cheap', 'special'
        ];

        foreach ($discountKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                return true;
            }
        }

        return false;
    }

    private function formatProductSummary(Product $product): array
    {
        return [
            'id'            => $product->id,
            'name'          => $product->name,
            'slug'          => $product->slug,
            'sku'           => $product->sku,
            'price'         => (float) $product->selling_price,
            'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
            'currency'      => 'USD',
            'category'      => $product->category?->name,
            'brand'         => $product->brand?->name,
            'stock'         => (float) $product->stock,
            'in_stock'      => !$product->track_inventory || $product->stock > 0,
            'image_url'     => $product->primaryImage?->url ?? null,
            'rating'        => (float) ($product->rating_avg ?? 5.0),
        ];
    }
}
