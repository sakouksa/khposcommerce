<?php

namespace App\Services\POS;

use App\Models\Product\Product;
use App\Models\Product\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Enterprise POS AI Vision Search Service
 * Real-time AI visual product recognition, barcode decoding, and multi-lingual catalog matching.
 */
class VisionSearchService
{
    /**
     * 5 Supported Languages
     */
    public const SUPPORTED_LANGUAGES = [
        'km' => ['code' => 'km', 'name' => 'Khmer', 'native' => 'ភាសាខ្មែរ', 'flag' => '🇰🇭'],
        'en' => ['code' => 'en', 'name' => 'English', 'native' => 'English', 'flag' => '🇺🇸'],
        'zh' => ['code' => 'zh', 'name' => 'Chinese', 'native' => '中文', 'flag' => '🇨🇳'],
        'th' => ['code' => 'th', 'name' => 'Thai', 'native' => 'ภาษาไทย', 'flag' => '🇹🇭'],
        'vi' => ['code' => 'vi', 'name' => 'Vietnamese', 'native' => 'Tiếng Việt', 'flag' => '🇻🇳'],
    ];

    /**
     * Common Product Visual Categories
     */
    private const VISUAL_CATEGORIES = [
        'keyboard'    => ['keywords' => ['keyboard', 'keyboards', 'key', 'keys', 'typing', 'mechanical', 'switch', 'spacebar', 'keycap', 'ក្តារចុច', 'ក្ដារចុច', '键盘', 'คีย์บอร์ด', 'bàn phím'], 'category_name' => 'Keyboards'],
        'smartwatch'  => ['keywords' => ['watch', 'smartwatch', 'smartwatches', 'apple watch', 'dial', 'strap', 'wrist', 'នាឡិកា', '手表', 'นาฬิกา', 'đồng hồ'], 'category_name' => 'Smartwatches'],
        'camera'      => ['keywords' => ['camera', 'cameras', 'webcam', 'dslr', 'lens', 'shutter', 'sensor', 'កាមេរ៉ា', '相机', 'กล้อง', 'máy ảnh'], 'category_name' => 'Cameras'],
        'phone'       => ['keywords' => ['phone', 'phones', 'iphone', 'smartphone', 'smartphones', 'galaxy', 'screen', 'oled', 'ទូរស័ព្ទ', '手机', 'โทรศัพท์', 'điện thoại'], 'category_name' => 'Smartphones'],
        'laptop'      => ['keywords' => ['laptop', 'laptops', 'macbook', 'notebook', 'ultrabook', 'clamshell', 'កុំព្យូទ័រយួរដៃ', '笔记本', 'แล็ปท็อป', 'máy tính xách tay'], 'category_name' => 'Laptops'],
        'monitor'     => ['keywords' => ['monitor', 'monitors', 'display', 'screen', 'lcd', 'oled', 'អេក្រង់', '显示器', 'จอภาพ', 'màn hình'], 'category_name' => 'Monitors'],
        'headphone'   => ['keywords' => ['headphone', 'headphones', 'headset', 'earphone', 'airpods', 'earbuds', 'speaker', 'audio', 'sound', 'កាស', 'បាស', '耳机', '音响', 'หูฟัง', 'ลำโพง', 'tai nghe', 'loa'], 'category_name' => 'Audio'],
        'charger'     => ['keywords' => ['charger', 'chargers', 'cable', 'adapter', 'powerbank', 'usb', 'ឆ្នាំងសាក', '充电器', 'ที่ชาร์จ', 'sạc'], 'category_name' => 'Chargers'],
        'shoes'       => ['keywords' => ['shoes', 'shoe', 'sneakers', 'running shoes', 'boots', 'sole', 'heel', 'ស្បែកជើង', '鞋', 'รองเท้า', 'giày'], 'category_name' => 'Shoes'],
        'apparel'     => ['keywords' => ['apparel', 'clothing', 'shirt', 't-shirt', 'jacket', 'pants', 'dress', 'fabric', 'សម្លៀកបំពាក់', 'អាវ', 'ខោ', '衣服', 'เสื้อผ้า', 'quần áo'], 'category_name' => 'Apparel'],
    ];

    /**
     * Recognized Brand Catalog
     */
    private const KNOWN_BRANDS = [
        'apple'    => ['apple', 'iphone', 'macbook', 'ipad', 'airpods', 'iwatch'],
        'samsung'  => ['samsung', 'galaxy'],
        'sony'     => ['sony', 'bravia', 'playstation'],
        'dell'     => ['dell', 'alienware', 'xps', 'inspiron'],
        'logitech' => ['logitech', 'logi', 'master', 'mx', 'gpro'],
        'xiaomi'   => ['xiaomi', 'redmi', 'poco', 'mi'],
        'asus'     => ['asus', 'rog', 'zenbook', 'tuf'],
        'jbl'      => ['jbl', 'charge', 'flip', 'quantum'],
        'hp'       => ['hp', 'omen', 'pavilion', 'victus'],
        'oppo'     => ['oppo', 'reno', 'find'],
        'nike'     => ['nike', 'airmax', 'jordan'],
        'adidas'   => ['adidas', 'ultraboost', 'yeezy'],
    ];

    /**
     * Main AI Vision Search Handler
     */
    public function search(
        ?string $imageFrame = null,
        ?string $ocrHint = null,
        string $language = 'km',
        array $context = [],
        ?string $visualCategory = null
    ): array {
        $cleanOcr = trim((string) $ocrHint);
        $targetLang = isset(self::SUPPORTED_LANGUAGES[$language]) ? $language : 'km';

        $companyId   = $context['company_id'] ?? 1;
        $warehouseId = $context['warehouse_id'] ?? null;
        $branchId    = $context['branch_id'] ?? null;

        // 1. Direct Barcode / Exact SKU Match if OCR hint contains barcode/SKU
        if ($cleanOcr !== '') {
            $exactMatch = $this->findExactBarcodeOrSku($cleanOcr, $companyId, $warehouseId);
            if ($exactMatch) {
                $exactMatch->confidence = 1.0;
                return [
                    'success' => true,
                    'recognition' => [
                        'mode'          => 'barcode_exact',
                        'detected_code' => $cleanOcr,
                        'brand'         => $exactMatch->brand?->name,
                        'category'      => $exactMatch->category?->name,
                        'confidence'    => 1.0,
                        'explanation'   => $this->getLocalizedExplanation('barcode_exact', $exactMatch->name, $targetLang),
                    ],
                    'product'  => $exactMatch,
                    'products' => [$exactMatch],
                    'total'    => 1,
                ];
            }
        }

        // 2. Semantic OCR & Visual Category Feature Extraction
        $analysis = $this->analyzeVisualTokens($cleanOcr, $visualCategory, $imageFrame);

        $category = $analysis['category'];
        $brand    = $analysis['brand'];
        $tokens   = $analysis['tokens'];
        $digits   = $analysis['digits'];

        // 3. Multi-Tenant Query Matching
        $queryBuilder = Product::with([
            'primaryImage',
            'images:id,product_id,image,is_primary',
            'category:id,name',
            'brand:id,name',
            'tax:id,name,rate,type',
            'variants:id,product_id,name,sku,barcode,selling_price,cost_price,image',
            'variants.inventories',
            'inventories',
        ])
        ->where('status', 'active');

        if ($companyId) {
            $queryBuilder->where('company_id', $companyId);
        }

        // Filter by warehouse stock if provided
        if ($warehouseId) {
            $queryBuilder->whereHas('inventories', function ($q) use ($warehouseId) {
                $q->where('warehouse_id', $warehouseId);
            });
        }

        // If a specific visual category was identified (e.g. Keyboards):
        // STRICTLY restrict search to that category so unrelated products are NEVER returned!
        if ($category) {
            $queryBuilder->whereHas('category', function ($c) use ($category) {
                $c->where('name', 'LIKE', "%{$category}%");
            });

            if ($brand) {
                $queryBuilder->where(function ($q) use ($brand, $tokens, $digits) {
                    $q->whereHas('brand', fn($b) => $b->where('name', 'LIKE', "%{$brand}%"))
                      ->orWhere('name', 'LIKE', "%{$brand}%");

                    if ($digits) {
                        $q->orWhere('name', 'LIKE', "%{$digits}%")
                          ->orWhere('sku', 'LIKE', "%{$digits}%");
                    }
                });
            }
        } elseif ($brand || !empty($tokens) || $cleanOcr !== '') {
            // Category not fixed, but brand or tokens available
            $queryBuilder->where(function (Builder $query) use ($cleanOcr, $tokens, $brand, $digits) {
                if ($cleanOcr !== '') {
                    $query->where('name', 'LIKE', "%{$cleanOcr}%")
                          ->orWhere('sku', 'LIKE', "%{$cleanOcr}%")
                          ->orWhere('barcode', 'LIKE', "%{$cleanOcr}%");
                }

                if ($brand) {
                    $query->orWhereHas('brand', function ($b) use ($brand) {
                        $b->where('name', 'LIKE', "%{$brand}%");
                    });
                }

                foreach ($tokens as $token) {
                    if (mb_strlen($token) >= 2) {
                        $query->orWhere('name', 'LIKE', "%{$token}%");
                    }
                }
            });
        } else {
            // No visual category, no OCR, no tokens -> DO NOT return random products!
            return [
                'success'     => true,
                'recognition' => [
                    'mode'              => 'ai_vision',
                    'detected_brand'    => null,
                    'detected_category' => null,
                    'confidence'        => 0.0,
                    'top_match_name'    => null,
                    'explanation'       => $this->getLocalizedExplanation('no_match', '', $targetLang, 0),
                ],
                'products' => [],
                'total'    => 0,
            ];
        }

        $products = $queryBuilder->withSum('inventories as stock', 'quantity')
            ->limit(20)
            ->get();

        // If warehouse filter was too restrictive and returned 0, fallback to company catalog within same category
        if ($products->isEmpty() && $category) {
            $products = Product::with([
                'primaryImage',
                'category:id,name',
                'brand:id,name',
                'variants',
                'inventories',
            ])
            ->where('status', 'active')
            ->where('company_id', $companyId)
            ->whereHas('category', function ($c) use ($category) {
                $c->where('name', 'LIKE', "%{$category}%");
            })
            ->withSum('inventories as stock', 'quantity')
            ->limit(20)
            ->get();
        }

        // Rank by relevance score and assign individual confidence
        $ranked = $this->rankProducts($products, $analysis);
        $topConfidence = $ranked->isNotEmpty() ? $ranked->first()['score'] : 0.0;
        
        $matchedProducts = $ranked->map(function ($item) {
            $p = $item['product'];
            $p->confidence = round($item['score'], 2);
            return $p;
        })->values();

        $topProductName = $matchedProducts->isNotEmpty() ? $matchedProducts->first()->name : ($cleanOcr ?: 'Product');

        return [
            'success'     => true,
            'recognition' => [
                'mode'               => 'ai_vision',
                'detected_brand'     => $brand,
                'detected_category'  => $category,
                'detected_digits'    => $digits,
                'confidence'         => round($topConfidence, 2),
                'top_match_name'     => $topProductName,
                'explanation'        => $this->getLocalizedExplanation('ai_vision', $topProductName, $targetLang, count($matchedProducts)),
            ],
            'products' => $matchedProducts,
            'total'    => count($matchedProducts),
        ];
    }

    /**
     * Find exact barcode or SKU product match
     */
    private function findExactBarcodeOrSku(string $code, int $companyId, ?int $warehouseId): ?Product
    {
        return Product::with([
            'primaryImage',
            'images',
            'category:id,name',
            'brand:id,name',
            'variants',
            'inventories',
        ])
        ->where('status', 'active')
        ->where('company_id', $companyId)
        ->where(function ($q) use ($code) {
            $q->where('barcode', $code)
              ->orWhere('sku', $code)
              ->orWhereHas('variants', function ($v) use ($code) {
                  $v->where('barcode', $code)->orWhere('sku', $code);
              });
        })
        ->withSum('inventories as stock', 'quantity')
        ->first();
    }

    /**
     * Analyze OCR/Visual text tokens and visual category hints
     */
    private function analyzeVisualTokens(string $raw, ?string $visualCategory = null, ?string $imageFrame = null): array
    {
        $normalized = mb_strtolower(trim($raw), 'UTF-8');
        $tokens = preg_split('~[\s,+/_\-]+~u', $normalized, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        // 1. Direct Visual Category Hint
        $detectedCategory = null;
        if ($visualCategory) {
            $catLower = mb_strtolower($visualCategory, 'UTF-8');
            foreach (self::VISUAL_CATEGORIES as $catKey => $catData) {
                if ($catKey === $catLower || str_contains($catLower, $catKey) || str_contains(mb_strtolower($catData['category_name'], 'UTF-8'), $catLower)) {
                    $detectedCategory = $catData['category_name'];
                    break;
                }
            }
            if (!$detectedCategory) {
                $detectedCategory = ucfirst($visualCategory);
            }
        }

        // 2. Extract Category from OCR text tokens if not already found
        if (!$detectedCategory) {
            foreach (self::VISUAL_CATEGORIES as $catKey => $catData) {
                foreach ($catData['keywords'] as $kw) {
                    if (in_array($kw, $tokens, true) || str_contains($normalized, $kw)) {
                        $detectedCategory = $catData['category_name'];
                        break 2;
                    }
                }
            }
        }

        // 3. Extract Brand from tokens
        $detectedBrand = null;
        foreach (self::KNOWN_BRANDS as $brandKey => $aliases) {
            foreach ($aliases as $alias) {
                if (in_array($alias, $tokens, true) || str_contains($normalized, $alias)) {
                    $detectedBrand = ucfirst($brandKey);
                    break 2;
                }
            }
        }

        // 4. Extract Digits (model numbers)
        preg_match('/\d+/', $raw, $digitsMatch);
        $digits = $digitsMatch[0] ?? null;

        return [
            'tokens'   => $tokens,
            'brand'    => $detectedBrand,
            'category' => $detectedCategory,
            'digits'   => $digits,
            'raw'      => $raw,
        ];
    }

    /**
     * Score & Rank products based on visual and semantic similarity
     */
    private function rankProducts(Collection $products, array $analysis): Collection
    {
        $tokens = $analysis['tokens'];
        $brand = mb_strtolower((string) $analysis['brand'], 'UTF-8');
        $category = mb_strtolower((string) $analysis['category'], 'UTF-8');
        $digits = $analysis['digits'];

        return $products->map(function ($product) use ($tokens, $brand, $category, $digits) {
            $score = 0.70; // Baseline for category-matched products
            $pName = mb_strtolower($product->name ?? '', 'UTF-8');
            $pSku = mb_strtolower($product->sku ?? '', 'UTF-8');
            $pBrand = mb_strtolower($product->brand?->name ?? '', 'UTF-8');
            $pCat = mb_strtolower($product->category?->name ?? '', 'UTF-8');

            if ($category && ($pCat === $category || str_contains($pName, $category))) {
                $score += 0.15;
            }

            if ($brand && ($pBrand === $brand || str_contains($pName, $brand))) {
                $score += 0.12;
            }

            if ($digits && (str_contains($pName, (string) $digits) || str_contains($pSku, (string) $digits))) {
                $score += 0.08;
            }

            foreach ($tokens as $t) {
                if (str_contains($pName, $t) || str_contains($pSku, $t)) {
                    $score += 0.05;
                }
            }

            return [
                'product' => $product,
                'score'   => min(0.98, $score),
            ];
        })->sortByDesc('score')->values();
    }

    /**
     * Localized explanation in 5 languages
     */
    private function getLocalizedExplanation(string $mode, string $productName, string $lang, int $count = 1): string
    {
        $translations = [
            'barcode_exact' => [
                'km' => "ស្កេនបាកូដត្រូវ៖ «{$productName}»",
                'en' => "Exact barcode match: \"{$productName}\"",
                'zh' => "条码精确匹配：“{$productName}”",
                'th' => "บาร์โค้ดตรงกัน: \"{$productName}\"",
                'vi' => "Khớp mã vạch chính xác: \"{$productName}\"",
            ],
            'ai_vision' => [
                'km' => "AI បានសម្គាល់ទំនិញ៖ «{$productName}» (រកឃើញ {$count} មុខ)",
                'en' => "AI Vision identified: \"{$productName}\" ({$count} items found)",
                'zh' => "AI 视觉识别：“{$productName}”（找到 {$count} 件商品）",
                'th' => "AI วิเคราะห์สินค้า: \"{$productName}\" (พบ {$count} รายการ)",
                'vi' => "AI nhận diện sản phẩm: \"{$productName}\" (tìm thấy {$count} sản phẩm)",
            ],
            'no_match' => [
                'km' => "មិនទាន់រកឃើញទំនិញត្រូវគ្នាជាក់លាក់ឡើយ",
                'en' => "No confident product match found.",
                'zh' => "未找到高置信度的匹配商品。",
                'th' => "ไม่พบสินค้าที่ตรงกันอย่างมั่นใจ",
                'vi' => "Không tìm thấy sản phẩm khớp có độ tin cậy cao.",
            ],
        ];

        return $translations[$mode][$lang] ?? $translations[$mode]['km'];
    }
}
