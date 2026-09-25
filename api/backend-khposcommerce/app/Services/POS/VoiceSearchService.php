<?php

namespace App\Services\POS;

use App\Models\Product\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class VoiceSearchService
{
    /**
     * Supported 5 Project Languages
     */
    public const SUPPORTED_LANGUAGES = [
        'km' => ['code' => 'km', 'name' => 'Khmer', 'native' => 'ភាសាខ្មែរ', 'flag' => '🇰🇭'],
        'en' => ['code' => 'en', 'name' => 'English', 'native' => 'English', 'flag' => '🇺🇸'],
        'zh' => ['code' => 'zh', 'name' => 'Chinese', 'native' => '中文', 'flag' => '🇨🇳'],
        'th' => ['code' => 'th', 'name' => 'Thai', 'native' => 'ไทย', 'flag' => '🇹🇭'],
        'vi' => ['code' => 'vi', 'name' => 'Vietnamese', 'native' => 'Tiếng Việt', 'flag' => '🇻🇳'],
    ];

    /**
     * Conversational Filler Stop Words Across 5 Languages
     */
    private const STOP_WORDS = [
        'km' => ['ចង់បាន', 'រកមើល', 'សូមស្វែងរក', 'ស្វែងរក', 'ទិញ', 'ចង់ទិញ', 'មានលក់', 'យក', 'ប្រាប់ពី', 'តម្លៃ', 'មួយ', 'ពីរ', 'បី', 'សូម', 'អោយ', 'ឱ្យ', 'បាទ', 'ចាស'],
        'en' => ['i want', 'look for', 'search for', 'find', 'buy', 'show me', 'need', 'get me', 'check', 'please', 'the', 'a', 'an', 'price of', 'do you have', 'what is the price of'],
        'zh' => ['我要买', '我想买', '找一下', '搜索', '有没有', '看看', '帮我找', '请问', '给我', '买', '要', '一台', '一个', '多少钱'],
        'th' => ['อยากได้', 'หา', 'ซื้อ', 'ขอซื้อ', 'มีไหม', 'ค้นหา', 'ช่วยหา', 'ต้องการ', 'ขอ', 'ราคา'],
        'vi' => ['tôi muốn mua', 'tìm kiếm', 'mua', 'cần', 'cho xem', 'có bán', 'tìm', 'giá', 'một cái'],
    ];

    /**
     * Greetings and Conversational Openers across 5 Languages & Phonetics
     */
    private const GREETING_LIST = [
        'km' => ['សួរស្តី', 'សួស្ដី', 'ជំរាបសួរ', 'ជំរាបសួរលោកអ្នក', 'សួរស្តីបង', 'សួស្ដីបង', 'សុខសប្បាយ', 'សុខសប្បាយជាទេ'],
        'phonetic_km' => ['so tod y', 'so todey', 'suosdei', 'suosdey', 'sousdey', 'susdey', 'soursdey', 'sou sdey', 'sour sdey', 'so tedy'],
        'en' => ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'welcome'],
        'zh' => ['你好', '您好', '早上好', '下午好'],
        'th' => ['สวัสดี', 'สวัสดีครับ', 'สวัสดีค่ะ', 'หวัดดี'],
        'vi' => ['xin chào', 'chào bạn', 'chào buổi sáng'],
    ];

    /**
     * Multi-Language Number Word Mapping
     */
    private const NUMBER_MAP = [
        // English
        'zero' => '0', 'one' => '1', 'two' => '2', 'three' => '3', 'four' => '4',
        'five' => '5', 'six' => '6', 'seven' => '7', 'eight' => '8', 'nine' => '9',
        'ten' => '10', 'eleven' => '11', 'twelve' => '12', 'thirteen' => '13', 'fourteen' => '14',
        'fifteen' => '15', 'sixteen' => '16', 'seventeen' => '17', 'eighteen' => '18', 'nineteen' => '19',
        'twenty' => '20', 'twenty five' => '25', 'twenty-five' => '25',
        'thirty' => '30', 'forty' => '40', 'fifty' => '50', 'sixty' => '60',
        'seventy' => '70', 'seventy five' => '75', 'seventy-five' => '75',
        'eighty' => '80', 'ninety' => '90', 'ninety seven' => '97', 'ninety-seven' => '97',
        'hundred' => '100',

        // Khmer
        'សូន្យ' => '0', 'មួយ' => '1', 'ពីរ' => '2', 'បី' => '3', 'បួន' => '4',
        'ប្រាំ' => '5', 'ប្រាំមួយ' => '6', 'ប្រាំពីរ' => '7', 'ប្រាំបី' => '8', 'ប្រាំបួន' => '9',
        'ដប់' => '10', 'ដប់មួយ' => '11', 'ដប់ពីរ' => '12', 'ដប់បី' => '13', 'ដប់បួន' => '14',
        'ដប់ប្រាំ' => '15', 'ដប់ប្រាំមួយ' => '16', 'ដប់ប្រាំពីរ' => '17', 'ដប់ប្រាំបី' => '18', 'ដប់ប្រាំបួន' => '19',
        'ម្ភៃ' => '20', 'ម្ភៃប្រាំ' => '25', 'សាមសិប' => '30', 'សែសិប' => '40', 'ហាសិប' => '50',
        'ហុកសិប' => '60', 'ចិតសិប' => '70', 'ចិតសិបប្រាំ' => '75', 'ប៉ែតសិប' => '80',
        'កៅសិប' => '90', 'កៅសិបប្រាំពីរ' => '97', 'មួយរយ' => '100',

        // Chinese
        '零' => '0', '一' => '1', '二' => '2', '两' => '2', '三' => '3', '四' => '4',
        '五' => '5', '六' => '6', '七' => '7', '八' => '8', '九' => '9',
        '十' => '10', '十五' => '15', '二十' => '20', '二十五' => '25',
        '七十五' => '75', '九十七' => '97', '一百' => '100',

        // Thai
        'ศูนย์' => '0', 'หนึ่ง' => '1', 'สอง' => '2', 'สาม' => '3', 'สี่' => '4',
        'ห้า' => '5', 'หก' => '6', 'เจ็ด' => '7', 'แปด' => '8', 'เก้า' => '9',
        'สิบ' => '10', 'สิบห้า' => '15', 'ยี่สิบ' => '20', 'ยี่สิบห้า' => '25',
        'เจ็ดสิบห้า' => '75', 'เก้าสิบเจ็ด' => '97', 'หนึ่งร้อย' => '100',

        // Vietnamese
        'không' => '0', 'một' => '1', 'hai' => '2', 'ba' => '3', 'bốn' => '4',
        'năm' => '5', 'sáu' => '6', 'bảy' => '7', 'tám' => '8', 'chín' => '9',
        'mười' => '10', 'mười lăm' => '15', 'hai mươi' => '20', 'hai mươi lăm' => '25',
        'bảy mươi lăm' => '75', 'chín mươi bảy' => '97', 'một trăm' => '100',
    ];

    /**
     * 5-Language Category & Concept Synonyms Dictionary
     */
    private const CATEGORY_SYNONYMS = [
        'keyboard' => [
            'keyboard', 'keybord', 'keyboards', 'keys', 'typing', 'mechanical keyboard', 'rgb keyboard',
            'ក្តារចុច', 'ក្ដារចុច', 'ឃីប៊ត', 'ឃីបត', 'ឃីប៊តហ្គេម',
            '键盘', '机械键盘', '静音键盘',
            'คีย์บอร์ด', 'แป้นพิมพ์',
            'bàn phím', 'bàn phím cơ',
        ],
        'phone' => [
            'phone', 'phones', 'smartphone', 'smartphones', 'iphone', 'cellular', 'mobile',
            'ទូរស័ព្ទ', 'ទូរសព្ទ', 'ទូរស័ព្ទដៃ', 'ទូរស័ព្ទស្មាតហ្វូន', 'អាយហ្វូន',
            '手机', '智能手机', '电话', '苹果手机',
            'โทรศัพท์', 'มือถือ', 'สมาร์ทโฟน',
            'điện thoại', 'smartphone', 'điện thoại di động',
        ],
        'laptop' => [
            'laptop', 'laptops', 'computer', 'computers', 'notebook', 'macbook', 'pc',
            'កុំព្យូទ័រ', 'កុំព្យូទ័រយួរដៃ', 'លែបថប', 'កុំព្យូទ័រលើតុ', 'ម៉ាក់ប៊ុក',
            '笔记本', '电脑', '笔记本电脑', '手提电脑',
            'โน้ตบุ๊ก', 'แล็ปท็อป', 'คอมพิวเตอร์',
            'máy tính xách tay', 'laptop', 'máy tính',
        ],
        'camera' => [
            'camera', 'cameras', 'lens', 'cam', 'webcam', 'dslr', 'action cam',
            'កាមេរ៉ា', 'ម៉ាស៊ីនថត', 'ថតរូប', 'ម៉ាស៊ីនថតរូប', 'កាមេរ៉ាសុវត្ថិភាព',
            '相机', '摄像机', '照相机', '单反',
            'กล้อง', 'กล้องถ่ายรูป', 'กล้องวิดีโอ',
            'máy ảnh', 'máy quay phim', 'camera',
        ],
        'shoes' => [
            'shoes', 'shoe', 'sneakers', 'footwear', 'boots', 'sandals', 'running shoes',
            'ស្បែកជើង', 'ស្បែកជើងប៉ាតា', 'ស្បែកជើងកីឡា', 'ស្បែកជើងស្បែក', 'ស្បែកជើងរត់',
            '鞋子', '运动鞋', '球鞋', '跑鞋', '皮鞋',
            'รองเท้า', 'รองเท้าผ้าใบ', 'รองเท้ากีฬา',
            'giày', 'giày thể thao', 'giày chạy bộ',
        ],
        'charger' => [
            'charger', 'chargers', 'adapter', 'cable', 'power', 'fast charger', 'power bank',
            'ឆ្នាំងសាក', 'ក្បាលសាក', 'ខ្សែសាក', 'ដុំសាក', 'ដុំសាកថ្ម', 'ឧបករណ៍សាកថ្ម',
            '充电器', '充电头', '数据线', '快充',
            'ที่ชาร์จ', 'หัวชาร์จ', 'สายชาร์จ',
            'củ sạc', 'sạc', 'dây sạc', 'cáp sạc',
        ],
        'watch' => [
            'watch', 'watches', 'smartwatch', 'smartwatches', 'wrist watch',
            'នាឡិកា', 'នាឡិកាឆ្លាតវៃ', 'នាឡិកាដៃ',
            '手表', '智能手表',
            'นาฬิกา', 'สมาร์ทวอทช์',
            'đồng hồ', 'đồng hồ thông minh',
        ],
        'audio' => [
            'audio', 'speaker', 'speakers', 'sound', 'headphone', 'headphones', 'earphone', 'earphones', 'earbuds', 'mic',
            'បាស', 'កាស', 'កាសត្រចៀក', 'ឧបករណ៍បំពងសំឡេង', 'សំឡេង', 'ស្ពីកគឺ',
            '音响', '耳机', '蓝牙音箱', '喇叭',
            'ลำโพง', 'หูฟัง', 'เครื่องเสียง',
            'loa', 'tai nghe', 'âm thanh',
        ],
        'monitor' => [
            'monitor', 'monitors', 'screen', 'display', 'lcd', 'led screen',
            'ម៉ូនីទ័រ', 'អេក្រង់', 'កញ្ចក់', 'កញ្ចក់អេក្រង់',
            '显示器', '屏幕',
            'จอมอนิเตอร์', 'หน้าจอ',
            'màn hình', 'màn hình máy tính',
        ],
        'apparel' => [
            'apparel', 'clothes', 'clothing', 'shirt', 'shirts', 't-shirt', 'pants', 'dress',
            'ខោអាវ', 'សម្លៀកបំពាក់', 'អាវ', 'ខោ', 'រ៉ូប',
            '衣服', '服装', '上衣', '裤子',
            'เสื้อผ้า', 'เสื้อ', 'กางเกง',
            'quần áo', 'áo', 'quần',
        ],
    ];

    /**
     * 5-Language Brand Mapping
     */
    private const BRAND_SYNONYMS = [
        'Apple'    => ['apple', 'iphone', 'ipad', 'macbook', 'airpods', 'iwatch', 'អាប់ផល', '苹果', 'แอปเปิ้ล'],
        'Xiaomi'   => ['xiaomi', 'redmi', 'poco', 'មី', 'សៀវមី', '小米', 'เสียวหมี่'],
        'Dell'     => ['dell', 'alienware', 'ដេល', '戴尔', 'เดลล์'],
        'Samsung'  => ['samsung', 'galaxy', 'សាំស៊ុង', '三星', 'ซัมซุง'],
        'Sony'     => ['sony', 'playstation', 'bravia', 'សូនី', '索尼', 'โซนี่'],
        'HP'       => ['hp', 'hewlett packard', 'អេចភី'],
        'JBL'      => ['jbl', 'ជេប៊ីអិល'],
        'Logitech' => ['logitech', 'ឡូជីថិច', '罗技', 'โลจิเทค'],
        'Asus'     => ['asus', 'rog', 'អេហ្ស៊ុស', '华硕'],
        'Oppo'     => ['oppo', 'អូប៉ូ'],
        'Nike'     => ['nike', 'ណៃគី', '耐克', 'ไนกี้'],
        'Adidas'   => ['adidas', 'អាឌីដាស', '阿迪达斯', 'อาดิดาส'],
        'Canon'    => ['canon', 'កាណុង', '佳能', 'แคนนอน'],
    ];

    /**
     * Main Voice Search Processing Pipeline
     *
     * @param string $transcript
     * @param string|null $requestedLang
     * @param User|null $user
     * @param array $context ['company_id' => int, 'branch_id' => int, 'warehouse_id' => int]
     * @return array
     */
    public function search(
        string $transcript,
        ?string $requestedLang = null,
        ?User $user = null,
        array $context = []
    ): array {
        $raw = trim($transcript);
        if ($raw === '') {
            return [
                'success' => false,
                'query'   => [
                    'original'   => '',
                    'normalized' => '',
                    'language'   => 'en',
                    'intent'     => 'empty',
                    'confidence' => 0.0,
                ],
                'products' => [],
            ];
        }

        // 1. Language Detection (5 Languages: Khmer, English, Chinese, Thai, Vietnamese)
        $lang = $this->detectLanguage($raw, $requestedLang);

        // 2. Normalization: Numbers, Phonetics, Stop words
        $normalized = $this->normalizeTranscript($raw, $lang);

        // 2.1 Check for Greetings (Khmer 'សួរស្តី' / phonetic 'so tod y', English 'hello', etc.)
        if ($this->isGreeting($raw, $normalized)) {
            $isKhmerGreeting = preg_match('/[\x{1780}-\x{17FF}]/u', $raw) || in_array(mb_strtolower($raw, 'UTF-8'), self::GREETING_LIST['phonetic_km'], true);
            $greetingLang = $isKhmerGreeting ? 'km' : $lang;

            return [
                'success'  => true,
                'query'    => [
                    'original'           => $raw,
                    'normalized'         => $isKhmerGreeting ? 'សួរស្តី' : $raw,
                    'language'           => $greetingLang,
                    'language_info'      => self::SUPPORTED_LANGUAGES[$greetingLang] ?? self::SUPPORTED_LANGUAGES['km'],
                    'intent'             => 'greeting',
                    'extracted_brand'    => null,
                    'extracted_category' => null,
                    'extracted_digits'   => null,
                    'confidence'         => 1.0,
                    'explanation'        => '👋 សួរស្តី! សូមនិយាយឈ្មោះទំនិញដែលអ្នកចង់ស្វែងរក',
                ],
                'products' => [],
                'total'    => 0,
            ];
        }

        // 3. Product Entity & Intent Extraction
        $extracted = $this->extractEntities($normalized, $raw);

        // 4. Multi-Tenant Enterprise Security Scoping
        $companyId   = $context['company_id'] ?? ($user?->company_id ?? 1);
        $warehouseId = $context['warehouse_id'] ?? null;
        $branchId    = $context['branch_id'] ?? null;

        // 5. Query REAL Database Products (Scoped by company/branch/warehouse)
        $searchResults = $this->queryDatabaseProducts($extracted, $companyId, $warehouseId, $branchId);

        return [
            'success'  => true,
            'query'    => [
                'original'           => $raw,
                'normalized'         => $extracted['resolved_query'],
                'language'           => $lang,
                'language_info'      => self::SUPPORTED_LANGUAGES[$lang] ?? self::SUPPORTED_LANGUAGES['en'],
                'intent'             => $extracted['intent'],
                'extracted_brand'    => $extracted['brand'],
                'extracted_category' => $extracted['category'],
                'extracted_digits'   => $extracted['digits'],
                'confidence'         => $searchResults['top_confidence'],
                'explanation'        => $extracted['explanation'],
            ],
            'products' => $searchResults['products'],
            'total'    => count($searchResults['products']),
        ];
    }

    /**
     * Check if speech transcript is a greeting
     */
    private function isGreeting(string $raw, string $normalized): bool
    {
        $rawLower = mb_strtolower(trim($raw), 'UTF-8');
        $normLower = mb_strtolower(trim($normalized), 'UTF-8');

        foreach (self::GREETING_LIST as $greetings) {
            foreach ($greetings as $g) {
                $gLower = mb_strtolower($g, 'UTF-8');
                if ($rawLower === $gLower || $normLower === $gLower) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Detect Language among 5 supported languages
     */
    private function detectLanguage(string $text, ?string $hint = null): string
    {
        if ($hint && isset(self::SUPPORTED_LANGUAGES[$hint])) {
            return $hint;
        }

        // Khmer Unicode (\u1780-\u17FF)
        if (preg_match('/[\x{1780}-\x{17FF}]/u', $text)) {
            return 'km';
        }

        // Chinese Unicode (\u4E00-\u9FFF)
        if (preg_match('/[\x{4E00}-\x{9FFF}]/u', $text)) {
            return 'zh';
        }

        // Thai Unicode (\u0E00-\u0E7F)
        if (preg_match('/[\x{0E00}-\x{0E7F}]/u', $text)) {
            return 'th';
        }

        // Vietnamese specific diacritics
        if (preg_match('/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/iu', $text)) {
            return 'vi';
        }

        return 'en';
    }

    /**
     * Normalize Speech Text: Clean spaces, convert number words, remove conversational filler
     */
    private function normalizeTranscript(string $raw, string $lang): string
    {
        $text = mb_strtolower(trim($raw), 'UTF-8');

        // 1. Remove Stop Words for the detected language
        $stopWords = self::STOP_WORDS[$lang] ?? self::STOP_WORDS['en'];
        foreach ($stopWords as $sw) {
            $swLower = mb_strtolower($sw, 'UTF-8');
            $text = str_replace($swLower, ' ', $text);
        }

        // 2. Convert Multi-Language Spoken Numbers
        foreach (self::NUMBER_MAP as $word => $digit) {
            $wordLower = mb_strtolower($word, 'UTF-8');
            $text = str_replace($wordLower, $digit, $text);
        }

        // 3. Normalize common STT phonetic variations
        $phoneticFixes = [
            'i phone' => 'iphone',
            'i-phone' => 'iphone',
            'spiker'  => 'speaker',
            'speeker' => 'speaker',
            'mac book'=> 'macbook',
            'j b l'   => 'jbl',
            'h p'     => 'hp',
            's 25'    => 's25',
            's 24'    => 's24',
        ];

        foreach ($phoneticFixes as $bad => $good) {
            $text = str_replace($bad, $good, $text);
        }

        return trim(preg_replace('/\s+/u', ' ', $text));
    }

    /**
     * Extract Brand, Category, Model Digits, and Intent
     */
    private function extractEntities(string $normalized, string $original): array
    {
        $tokens = preg_split('~[\s,+/_\-]+~u', $normalized, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        preg_match('/\d+/', $original, $digitsMatch);
        $extractedDigits = $digitsMatch[0] ?? null;

        // 1. Extract Brand
        $extractedBrand = null;
        foreach (self::BRAND_SYNONYMS as $brandName => $aliases) {
            foreach ($tokens as $token) {
                if (mb_strtolower($brandName, 'UTF-8') === $token) {
                    $extractedBrand = $brandName;
                    break 2;
                }
                foreach ($aliases as $alias) {
                    if (mb_strtolower($alias, 'UTF-8') === $token || similar_text($token, mb_strtolower($alias, 'UTF-8'), $pct) && $pct >= 85) {
                        $extractedBrand = $brandName;
                        break 2;
                    }
                }
            }
        }

        // 2. Extract Category / Concept
        $extractedCategory = null;
        $conceptKeyFound   = null;
        foreach (self::CATEGORY_SYNONYMS as $conceptKey => $synonyms) {
            foreach ($tokens as $token) {
                if ($conceptKey === $token) {
                    $conceptKeyFound   = $conceptKey;
                    $extractedCategory = ucfirst($conceptKey);
                    break 2;
                }
                foreach ($synonyms as $syn) {
                    $synLower = mb_strtolower($syn, 'UTF-8');
                    if ($synLower === $token || (mb_strlen($token) >= 3 && str_contains($synLower, $token))) {
                        $conceptKeyFound   = $conceptKey;
                        $extractedCategory = ucfirst($conceptKey);
                        break 2;
                    }
                }
            }
        }

        // 3. Determine Intent & Resolved Query
        if ($extractedDigits) {
            $parts = array_filter([$extractedBrand, $extractedCategory, $extractedDigits]);
            $resolved = !empty($parts) ? implode(' ', $parts) : $normalized;
            return [
                'intent'         => 'exact_product',
                'brand'          => $extractedBrand,
                'category'       => $extractedCategory,
                'digits'         => $extractedDigits,
                'resolved_query' => $resolved,
                'explanation'    => "Specific Model identified: {$resolved}",
            ];
        }

        if ($extractedBrand && $extractedCategory) {
            $resolved = "{$extractedBrand} {$extractedCategory}";
            return [
                'intent'         => 'brand_and_category',
                'brand'          => $extractedBrand,
                'category'       => $extractedCategory,
                'digits'         => null,
                'resolved_query' => $resolved,
                'explanation'    => "Brand & Category filter: {$resolved}",
            ];
        }

        if ($extractedCategory) {
            return [
                'intent'         => 'broad_category',
                'brand'          => null,
                'category'       => $extractedCategory,
                'digits'         => null,
                'resolved_query' => $extractedCategory,
                'explanation'    => "Category search: All {$extractedCategory} products",
            ];
        }

        if ($extractedBrand) {
            return [
                'intent'         => 'brand_only',
                'brand'          => $extractedBrand,
                'category'       => null,
                'digits'         => null,
                'resolved_query' => $extractedBrand,
                'explanation'    => "Brand search: All {$extractedBrand} products",
            ];
        }

        return [
            'intent'         => 'keyword',
            'brand'          => null,
            'category'       => null,
            'digits'         => null,
            'resolved_query' => $normalized ?: $original,
            'explanation'    => "Keyword search: \"{$normalized}\"",
        ];
    }

    /**
     * Query REAL Database Products with Multi-Tier Ranking and Confidence Score
     */
    private function queryDatabaseProducts(
        array $extracted,
        int $companyId,
        ?int $warehouseId = null,
        ?int $branchId = null
    ): array {
        $queryText = trim($extracted['resolved_query']);
        $queryLower = mb_strtolower($queryText, 'UTF-8');

        // Base Product Query scoped to company and active status
        $baseQuery = Product::with([
            'primaryImage',
            'images:id,product_id,image,is_primary',
            'category:id,name',
            'brand:id,name',
            'unit:id,name,symbol',
            'tax:id,name,rate,type',
            'variants' => function ($vq) {
                $vq->select('id', 'product_id', 'name', 'sku', 'barcode', 'selling_price', 'cost_price', 'image');
            },
            'variants.inventories',
            'inventories',
        ])
        ->where('status', 'active')
        ->when($companyId > 0, fn($q) => $q->where('company_id', $companyId))
        ->when($warehouseId, function ($q, $wId) {
            $q->whereHas('inventories', fn($iq) => $iq->where('warehouse_id', $wId));
        })
        ->withSum('inventories as stock', 'quantity');

        // Fetch candidate pool
        $candidates = $baseQuery->limit(100)->get();

        if ($candidates->isEmpty()) {
            return [
                'top_confidence' => 0.0,
                'products'       => [],
            ];
        }

        // Rank and score candidates
        $scored = [];

        foreach ($candidates as $p) {
            $score = 0.0;
            $matchReason = '';

            $pName    = mb_strtolower($p->name ?? '', 'UTF-8');
            $pSku     = mb_strtolower($p->sku ?? '', 'UTF-8');
            $pBarcode = mb_strtolower($p->barcode ?? '', 'UTF-8');
            $pCat     = mb_strtolower($p->category?->name ?? '', 'UTF-8');
            $pBrand   = mb_strtolower($p->brand?->name ?? '', 'UTF-8');

            // Priority 1: Exact Barcode
            if ($pBarcode !== '' && ($pBarcode === $queryLower || str_contains($queryLower, $pBarcode))) {
                $score = 1.00;
                $matchReason = "Exact Barcode ({$p->barcode})";
            }
            // Priority 2: Exact SKU
            elseif ($pSku !== '' && ($pSku === $queryLower || str_contains($queryLower, $pSku))) {
                $score = 0.98;
                $matchReason = "Exact SKU ({$p->sku})";
            }
            // Priority 3: Exact Normalized Product Name
            elseif ($pName === $queryLower) {
                $score = 0.95;
                $matchReason = "Exact Product Name";
            }
            // Priority 4: Brand + Category + Model digits (e.g. Apple Keyboard 75)
            elseif (
                $extracted['brand'] &&
                $extracted['category'] &&
                $extracted['digits'] &&
                str_contains($pName, mb_strtolower($extracted['brand'])) &&
                (str_contains($pName, mb_strtolower($extracted['category'])) || str_contains($pCat, mb_strtolower($extracted['category']))) &&
                str_contains($pName, $extracted['digits'])
            ) {
                $score = 0.92;
                $matchReason = "Brand + Category + Model ({$extracted['digits']})";
            }
            // Priority 5: Brand + Category (e.g. Apple Keyboard)
            elseif (
                $extracted['brand'] &&
                $extracted['category'] &&
                str_contains($pName, mb_strtolower($extracted['brand'])) &&
                (str_contains($pName, mb_strtolower($extracted['category'])) || str_contains($pCat, mb_strtolower($extracted['category'])))
            ) {
                $score = 0.88;
                $matchReason = "Brand + Category Match";
            }
            // Priority 6: Broad Category Match
            elseif (
                $extracted['category'] &&
                (str_contains($pName, mb_strtolower($extracted['category'])) || str_contains($pCat, mb_strtolower($extracted['category'])))
            ) {
                $score = 0.82;
                $matchReason = "Category Match ({$extracted['category']})";
            }
            // Priority 7: Brand Match Only
            elseif ($extracted['brand'] && (str_contains($pName, mb_strtolower($extracted['brand'])) || str_contains($pBrand, mb_strtolower($extracted['brand'])))) {
                $score = 0.80;
                $matchReason = "Brand Match ({$extracted['brand']})";
            }
            // Priority 8: Substring or Fuzzy Match
            elseif (str_contains($pName, $queryLower)) {
                $score = 0.75;
                $matchReason = "Name Contains Query";
            } else {
                similar_text($queryLower, $pName, $simPercent);
                $simScore = $simPercent / 100.0;
                if ($simScore >= 0.50) {
                    $score = $simScore * 0.70;
                    $matchReason = "Fuzzy Match (" . round($simPercent) . "%)";
                }
            }

            if ($score >= 0.25) {
                // Stock awareness
                $stockQuantity = (float)($p->stock ?? 0);
                $isOutOfStock  = ($stockQuantity <= 0 && (bool)($p->track_inventory ?? true));

                $productData = [
                    'id'               => $p->id,
                    'name'             => $p->name,
                    'sku'              => $p->sku,
                    'barcode'          => $p->barcode,
                    'selling_price'    => (float) $p->selling_price,
                    'cost_price'       => (float) $p->cost_price,
                    'compare_price'    => $p->compare_price ? (float) $p->compare_price : null,
                    'stock'            => $stockQuantity,
                    'is_out_of_stock'  => $isOutOfStock,
                    'track_inventory'  => (bool) $p->track_inventory,
                    'has_variants'     => (bool) $p->has_variants,
                    'has_imei'         => (bool) ($p->has_imei ?? false),
                    'category'         => $p->category ? ['id' => $p->category->id, 'name' => $p->category->name] : null,
                    'brand'            => $p->brand ? ['id' => $p->brand->id, 'name' => $p->brand->name] : null,
                    'image'            => $p->primaryImage?->image ?? $p->images?->first()?->image ?? null,
                    'variants'         => $p->variants,
                    'match_score'      => round($score, 2),
                    'confidence_pct'   => round($score * 100),
                    'match_reason'     => $matchReason,
                ];

                $scored[] = [
                    'score'   => $score,
                    'product' => $productData,
                ];
            }
        }

        // Sort by highest confidence score first
        usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);

        $rankedProducts = array_map(fn($item) => $item['product'], $scored);
        $topConfidence  = !empty($scored) ? $scored[0]['score'] : 0.0;

        return [
            'top_confidence' => round($topConfidence, 2),
            'products'       => $rankedProducts,
        ];
    }
}
