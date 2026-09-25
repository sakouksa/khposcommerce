<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private string $provider;
    private ?string $apiKey;
    private string $model;
    private ?string $baseUrl;

    public function __construct(
        private readonly ToolRegistry $toolRegistry,
        private readonly PromptService $promptService
    ) {
        $this->resolveProviderConfig();
    }

    /**
     * Resolve the active AI provider configuration (Gemini, Groq, OpenAI, DeepSeek, OpenRouter, or Auto).
     */
    private function resolveProviderConfig(): void
    {
        $preferred = config('services.ai.provider', env('AI_PROVIDER', 'auto'));

        // 1. Google Gemini (Free Tier: 15 RPM / 1M TPM)
        $geminiKey = config('services.ai.gemini.api_key', env('GEMINI_API_KEY'));
        if (($preferred === 'gemini' || $preferred === 'auto') && !empty($geminiKey) && !str_starts_with($geminiKey, 'your-')) {
            $this->provider = 'gemini';
            $this->apiKey = $geminiKey;
            $this->model = config('services.ai.gemini.model', env('GEMINI_MODEL', 'gemini-2.0-flash'));
            $this->baseUrl = config('services.ai.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta/openai/');
            return;
        }

        // 2. Groq (Free Tier: Ultra-Fast Llama-3.3-70b)
        $groqKey = config('services.ai.groq.api_key', env('GROQ_API_KEY'));
        if (($preferred === 'groq' || $preferred === 'auto') && !empty($groqKey) && !str_starts_with($groqKey, 'your-')) {
            $this->provider = 'groq';
            $this->apiKey = $groqKey;
            $this->model = config('services.ai.groq.model', env('GROQ_MODEL', 'llama-3.3-70b-versatile'));
            $this->baseUrl = config('services.ai.groq.base_url', 'https://api.groq.com/openai/v1/');
            return;
        }

        // 3. DeepSeek
        $deepseekKey = config('services.ai.deepseek.api_key', env('DEEPSEEK_API_KEY'));
        if (($preferred === 'deepseek' || $preferred === 'auto') && !empty($deepseekKey) && !str_starts_with($deepseekKey, 'your-')) {
            $this->provider = 'deepseek';
            $this->apiKey = $deepseekKey;
            $this->model = config('services.ai.deepseek.model', env('DEEPSEEK_MODEL', 'deepseek-chat'));
            $this->baseUrl = config('services.ai.deepseek.base_url', 'https://api.deepseek.com/v1/');
            return;
        }

        // 4. OpenRouter
        $openrouterKey = config('services.ai.openrouter.api_key', env('OPENROUTER_API_KEY'));
        if (($preferred === 'openrouter' || $preferred === 'auto') && !empty($openrouterKey) && !str_starts_with($openrouterKey, 'your-')) {
            $this->provider = 'openrouter';
            $this->apiKey = $openrouterKey;
            $this->model = config('services.ai.openrouter.model', env('OPENROUTER_MODEL', 'google/gemini-2.0-flash-exp:free'));
            $this->baseUrl = config('services.ai.openrouter.base_url', 'https://openrouter.ai/api/v1/');
            return;
        }

        // 5. OpenAI
        $openaiKey = config('services.openai.api_key', env('OPENAI_API_KEY'));
        if (!empty($openaiKey) && !str_starts_with($openaiKey, 'your-') && $openaiKey !== 'mock-key') {
            $this->provider = 'openai';
            $this->apiKey = $openaiKey;
            $this->model = config('services.openai.model', env('OPENAI_MODEL', 'gpt-4o-mini'));
            $this->baseUrl = config('services.ai.openai.base_url', 'https://api.openai.com/v1/');
            return;
        }

        // 6. Intelligent Multilingual Heuristic Engine
        $this->provider = 'heuristic';
        $this->apiKey = null;
        $this->model = 'multilingual-heuristic-v2';
        $this->baseUrl = null;
    }

    /**
     * Send chat messages to active AI Model (OpenAI compatible HTTP API) or execute heuristic fallback.
     *
     * @param array $messages [{role: 'user'|'assistant'|'system'|'tool', content: string, tool_call_id?: string, name?: string}]
     * @param array $context Additional execution context
     * @return array {role: string, content: ?string, tool_calls?: array}
     */
    public function chatCompletion(array $messages, array $context = []): array
    {
        if ($this->provider !== 'heuristic' && !empty($this->apiKey) && !empty($this->baseUrl)) {
            try {
                return $this->callOpenAICompatibleApi($messages, $context);
            } catch (\Throwable $e) {
                Log::warning("AI Provider [{$this->provider}] failed: " . $e->getMessage() . ", switching to multilingual heuristic engine.");
            }
        }

        // Resilient Multilingual Fallback Engine
        return $this->heuristicFallbackCompletion($messages, $context);
    }

    /**
     * Call any OpenAI-compatible API endpoint (Google Gemini, Groq, DeepSeek, OpenAI, OpenRouter).
     */
    protected function callOpenAICompatibleApi(array $messages, array $context): array
    {
        $tools = $this->toolRegistry->getToolDefinitions();
        $url = rtrim($this->baseUrl, '/') . '/chat/completions';

        $payload = [
            'model'       => $this->model,
            'messages'    => $messages,
            'tools'       => $tools,
            'tool_choice' => 'auto',
            'temperature' => 0.2,
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(25)->post($url, $payload);

        if (!$response->successful()) {
            throw new \RuntimeException("API request error [{$response->status()}]: " . $response->body());
        }

        $body = $response->json();
        $choice = $body['choices'][0]['message'] ?? null;

        if (!$choice) {
            return [
                'role'    => 'assistant',
                'content' => 'How can I assist you with your shopping today?',
            ];
        }

        $toolCalls = [];
        if (!empty($choice['tool_calls'])) {
            foreach ($choice['tool_calls'] as $tc) {
                $toolCalls[] = [
                    'id'       => $tc['id'] ?? ('call_' . uniqid()),
                    'type'     => 'function',
                    'function' => [
                        'name'      => $tc['function']['name'] ?? '',
                        'arguments' => is_string($tc['function']['arguments'] ?? '') 
                            ? $tc['function']['arguments'] 
                            : json_encode($tc['function']['arguments'] ?? []),
                    ],
                ];
            }
        }

        return [
            'role'       => 'assistant',
            'content'    => $choice['content'] ?? null,
            'tool_calls' => $toolCalls,
        ];
    }

    /**
     * Intelligent local multilingual heuristic engine with strict, concise, zero-fluff responses.
     */
    protected function heuristicFallbackCompletion(array $messages, array $context): array
    {
        $lastMessage = end($messages);
        $lastRole = $lastMessage['role'] ?? 'user';
        $content = trim($lastMessage['content'] ?? '');

        // Resolve language from latest user query or explicit context
        $detectedLang = $this->resolveLanguage($messages, $context);

        // If the last message was a tool response, summarize directly and concisely in user's language
        if ($lastRole === 'tool') {
            $toolData = json_decode($content, true) ?: [];
            $toolName = $lastMessage['name'] ?? '';

            return [
                'role'    => 'assistant',
                'content' => $this->summarizeToolResult($toolName, $toolData, $detectedLang),
            ];
        }

        $lower = mb_strtolower($content);

        // 1. Intent: Promotions & Discounts (Deals, Special Offers)
        if ($this->matchesAny($lower, [
            'បញ្ចុះតម្លៃ', 'ប្រូម៉ូសិន', 'ការផ្តល់ជូនពិសេស', 'ការបញ្ចុះតម្លៃ', 'ថោក', 'លក់ឡៃឡុង',
            'โปรโมชั่น', 'ลดราคา', 'ส่วนลด', 'สินค้าราคาพิเศษ',
            'khuyến mãi', 'giảm giá', 'ưu đãi', 'giá sốc',
            '特惠', '打折', '促销', '优惠', '特价',
            'special offer', 'special offers', 'discounts', 'discount', 'deals', 'deal', 'sale', 'promo', 'promotions', 'offers'
        ])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'recommend_products',
                            'arguments' => json_encode(['type' => 'deals', 'limit' => 4]),
                        ],
                    ],
                ],
            ];
        }

        // 2. Intent: Order Tracking by Order Number (e.g. "ORD-12345")
        if (preg_match('/(ORD-[A-Z0-9]+)/i', $content, $matches)) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'get_order_status',
                            'arguments' => json_encode(['order_number' => strtoupper($matches[1])]),
                        ],
                    ],
                ],
            ];
        }

        // 3. Intent: Account & Order History (Past orders, Tracking general status)
        if ($this->matchesAny($lower, [
            'តាមដាន', 'កញ្ចប់ទំនិញ', 'ការបញ្ជាទិញ', 'ការកុម្ម៉ង់', 'ប្រវត្តិទិញ',
            'ติดตาม', 'คำสั่งซื้อ', 'สถานะพัสดุ',
            'theo dõi đơn', 'lịch sử đơn', 'tra cứu đơn',
            '追踪订单', '查订单', '订单状态', '物流进度',
            'track order', 'order status', 'my order', 'order history', 'where is my order', 'recent orders'
        ])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'get_order_history',
                            'arguments' => json_encode(['limit' => 5]),
                        ],
                    ],
                ],
            ];
        }

        // 4. Intent: Cart Management (View cart, Clear cart)
        if ($this->matchesAny($lower, ['មើលកន្ត្រក', 'កន្ត្រកទំនិញ', 'កន្ត្រក', 'ตะกร้า', 'giỏ hàng', '购物车', 'view cart', 'my cart', 'show cart', 'what is in my cart'])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'get_cart',
                            'arguments' => json_encode([]),
                        ],
                    ],
                ],
            ];
        }

        if ($this->matchesAny($lower, ['លុបកន្ត្រក', 'សម្អាតកន្ត្រក', 'លុបទំនិញក្នុងកន្ត្រក', 'ล้างตะกร้า', 'xóa giỏ hàng', '清空购物车', 'clear cart', 'empty cart'])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'clear_cart',
                            'arguments' => json_encode([]),
                        ],
                    ],
                ],
            ];
        }

        // 5. Intent: Best Sellers & Popular Products
        if ($this->matchesAny($lower, [
            'លក់ដាច់', 'ពេញនិយម', 'ទំនិញពេញនិយម', 'ទំនិញលក់ដាច់', 'ទំនិញណាល្អ',
            'ขายดี', 'ยอดนิยม', 'สินค้าแนะนำ',
            'bán chạy', 'phổ biến', 'nổi bật',
            '热销', '热卖', '爆款', '畅销',
            'best seller', 'best sellers', 'popular', 'top selling', 'trending', 'featured products', 'top rated'
        ])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'recommend_products',
                            'arguments' => json_encode(['type' => 'popular', 'limit' => 4]),
                        ],
                    ],
                ],
            ];
        }

        // 6. Intent: Dedicated Human Customer Support & Escalation
        if ($this->matchesAny($lower, [
            'សេវាបម្រើអតិថិជន', 'សេវាអតិថិជន', 'សេវាកម្មអតិថិជន', 'ទាក់ទងមនុស្ស', 'ជួបមនុស្ស', 'ជួបបុគ្គលិក', 'ទំនាក់ទំនងបុគ្គលិក', 'សុំជួបមនុស្ស', 'សេវាជំនួយ',
            'บริการลูกค้า', 'ติดต่อเจ้าหน้าที่', 'ฝ่ายบริการลูกค้า', 'คุยกับคน',
            'chăm sóc khách hàng', 'gặp nhân viên', 'tư vấn viên', 'hỗ trợ trực tiếp',
            '人工客服', '联系人工', '找人工', '人工支持', '转人工',
            'customer support', 'human support', 'talk to human', 'talk to agent', 'live agent', 'support team', 'speak with agent', 'customer care', 'customer service', 'contact support', 'talk to support', 'support ticket', 'soport'
        ])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'create_support_request',
                            'arguments' => json_encode([
                                'subject' => 'Customer assistance request',
                                'message' => $content,
                            ]),
                        ],
                    ],
                ],
            ];
        }

        // 7. Intent: Shipping Policy & Delivery Rates
        if ($this->matchesAny($lower, [
            'ដឹកជញ្ជូន', 'ថ្លៃដឹក', 'សេវាដឹក', 'ដឹកដល់ផ្ទះ',
            'การจัดส่ง', 'ค่าส่ง', 'ส่งของ',
            'vận chuyển', 'giao hàng', 'phí ship',
            '配送方式', '运费', '物流费用', '送货',
            'shipping method', 'shipping rate', 'shipping cost', 'delivery fee', 'delivery time', 'how long is shipping', 'postage'
        ])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'get_shipping_methods',
                            'arguments' => json_encode([]),
                        ],
                    ],
                ],
            ];
        }

        // 8. Intent: Payment Methods
        if ($this->matchesAny($lower, [
            'ទូទាត់', 'បង់ប្រាក់', 'បង់លុយ', 'របៀបបង់ប្រាក់', 'khqr', 'aba',
            'การชำระเงิน', 'จ่ายเงิน', 'วิธีชำระเงิน',
            'thanh toán', 'phương thức thanh toán', 'cách thanh toán',
            '支付方式', '付款方式', '扫码支付',
            'payment method', 'how to pay', 'payment options', 'accept payment', 'pay with', 'credit card', 'cod', 'cash on delivery'
        ])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'get_payment_methods',
                            'arguments' => json_encode([]),
                        ],
                    ],
                ],
            ];
        }

        // 9. Intent: Store FAQ / Return Policies / Warranty
        if ($this->matchesAny($lower, [
            'គោលការណ៍', 'ប្តូរទំនិញ', 'សងលុយ', 'ការធានា', 'ធានា',
            'นโยบาย', 'คืนเงิน', 'การรับประกัน', 'เปลี่ยนสินค้า',
            'chính sách', 'hoàn tiền', 'bảo hành', 'đổi trả',
            '退货政策', '退款', '售后保修', '质保',
            'return policy', 'refund policy', 'warranty', 'guarantee', 'store policy', 'opening hours'
        ])) {
            return [
                'role'       => 'assistant',
                'content'    => null,
                'tool_calls' => [
                    [
                        'id'       => 'call_' . uniqid(),
                        'type'     => 'function',
                        'function' => [
                            'name'      => 'search_faq',
                            'arguments' => json_encode(['query' => $content]),
                        ],
                    ],
                ],
            ];
        }

        // 10. Intent: Greetings & Introductions
        if ($this->matchesAny($lower, [
            'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you',
            'សួស្តី', 'ជំរាបសួរ', 'ជម្រាបសួរ', 'សុខសប្បាយ',
            'สวัสดี', 'หวัดดี',
            'xin chào', 'chào bạn',
            '你好', '您好', '早安'
        ])) {
            return [
                'role'    => 'assistant',
                'content' => $this->getGreetingResponse($detectedLang),
            ];
        }

        // 11. Intent: Product Search & Filtering (Default Action)
        $searchArgs = ['query' => $content];
        if (preg_match('/(?:under|ក្រោម|តិចជាង|ต่ำกว่า|dưới|低于)\s*\$?(\d+)/iu', $content, $priceMatches)) {
            $searchArgs['max_price'] = (float) $priceMatches[1];
            $searchArgs['query'] = trim(preg_replace('/(?:under|ក្រោម|តិចជាង|ต่ำกว่า|dưới|低于)\s*\$?\d+/iu', '', $content));
        }

        return [
            'role'       => 'assistant',
            'content'    => null,
            'tool_calls' => [
                [
                    'id'       => 'call_' . uniqid(),
                    'type'     => 'function',
                    'function' => [
                        'name'      => 'search_products',
                        'arguments' => json_encode($searchArgs),
                    ],
                ],
            ],
        ];
    }

    /**
     * Generate friendly, short greeting response matching language (1 sentence).
     */
    private function getGreetingResponse(string $lang): string
    {
        return match ($lang) {
            'km' => "សួស្តី! តើលោកអ្នកចង់ស្វែងរកទំនិញ ឬឱ្យខ្ញុំជួយអ្វីដែរថ្ងៃនេះ?",
            'th' => "สวัสดีค่ะ! ต้องการให้ฉันช่วยค้นหาสินค้าหรือบริการด้านใดคะ?",
            'vi' => "Xin chào! Tôi có thể hỗ trợ bạn tìm kiếm sản phẩm hoặc thông tin gì hôm nay?",
            'zh' => "您好！请问今天有什么我可以帮您的？",
            default => "Hello! How can I assist you with your shopping today?",
        };
    }

    /**
     * Generate concise, zero-fluff 1-sentence summaries for tool responses matching customer's language.
     */
    protected function summarizeToolResult(string $toolName, array $data, string $lang = 'en'): string
    {
        $count = count($data['products'] ?? $data['orders'] ?? []);
        $type = $data['type'] ?? '';

        switch ($lang) {
            case 'km':
                return match ($toolName) {
                    'recommend_products' => $type === 'deals'
                        ? "នេះជាទំនិញបញ្ចុះតម្លៃ និងប្រូម៉ូសិនពិសេសដែលមានក្នុងហាង៖"
                        : ($type === 'popular'
                            ? "នេះជាទំនិញពេញនិយម និងលក់ដាច់ប្រចាំហាង៖"
                            : "នេះជាទំនិញដែលលោកអ្នកកំពុងស្វែងរក៖"),

                    'search_products' => !empty($data['products'])
                        ? "នេះគឺជាទំនិញដែលលោកអ្នកកំពុងស្វែងរក៖"
                        : "សុំទោស ហាងយើងខ្ញុំមិនមានទំនិញ/សេវាកម្មនេះទេ។ តើលោកអ្នកចង់ស្វែងរកអ្វីផ្សេងទៀតដែរឬទេ?",

                    'get_product_details' => !empty($data['product'])
                        ? "ព័ត៌មានលម្អិត **{$data['product']['name']}** (តម្លៃ៖ \${$data['product']['price']}, ស្តុក៖ " . ($data['product']['is_in_stock'] ? 'មានក្នុងស្តុក' : 'អស់ពីស្តុក') . ", ពិន្ទុ៖ ⭐ {$data['product']['rating_avg']}/5)៖"
                        : "សុំទោស មិនមានព័ត៌មានលម្អិតសម្រាប់ទំនិញនេះទេ។",

                    'add_to_cart' => !empty($data['success'])
                        ? "✅ បានបន្ថែម **" . ($data['added_product']['name'] ?? 'ទំនិញ') . "** ទៅក្នុងកន្ត្រក (សរុប៖ {$data['item_count']} មុខ, \${$data['total']})។"
                        : ($data['message'] ?? 'មិនអាចបន្ថែមទំនិញទៅក្នុងកន្ត្រកបានទេ។'),

                    'get_cart' => !empty($data['items'])
                        ? "🛒 កន្ត្រករបស់អ្នកមាន {$data['item_count']} មុខ (សរុប៖ \${$data['total']})។"
                        : "🛒 កន្ត្រកទំនិញរបស់អ្នកនៅទំនេរ។",

                    'clear_cart' => "🗑️ កន្ត្រកទំនិញត្រូវបានសម្អាតរួចរាល់។",

                    'get_order_status' => !empty($data['found'])
                        ? "📦 **ការបញ្ជាទិញ #{$data['order']['order_number']}** (ស្ថានភាព៖ **" . strtoupper($data['order']['status']) . "**, ដឹកជញ្ជូន៖ " . ($data['order']['shipping_carrier'] ?? 'Standard Delivery') . ", កូដតាមដាន៖ `{$data['order']['tracking_number']}`)"
                        : "សុំទោស រកមិនឃើញការបញ្ជាទិញនេះទេ។ សូមពិនិត្យមើលលេខកូដកុម្ម៉ង់ម្តងទៀត។",

                    'get_order_history' => !empty($data['orders'])
                        ? "នេះជាប្រវត្តិការបញ្ជាទិញរបស់អ្នក៖"
                        : "សូមចូលគណនី (Log In) របស់អ្នកដើម្បីពិនិត្យមើលប្រវត្តិបញ្ជាទិញ ឬផ្ញើលេខកូដកុម្ម៉ង់ (ឧ. ORD-2026-XXXX)។",

                    'get_shipping_methods' => "🚚 យើងមានសេវាដឹកជញ្ជូនទូទាំង ២៥ ខេត្ត-ក្រុង (Standard Delivery 1-3 ថ្ងៃ និង Express Shipping)។",

                    'get_payment_methods' => "💳 យើងទទួលការទូទាត់តាម **Bakong KHQR**, **ABA PAY**, **Visa/MasterCard** និង **COD (ទូទាត់ពេលទទួលទំនិញ)**។",

                    'create_support_request' => "🎫 **សំបុត្រជំនួយ (#{$data['ticket_id']})**\nក្រុមការងារបានទទួលសំណើរបស់អ្នកហើយ។\n📞 Hotline: **+855 71 888 999** / Telegram: **@EnterpriseShopBot**",

                    'search_faq' => "នេះជាព័ត៌មានគោលការណ៍ហាងដែលពាក់ព័ន្ធ៖",

                    default => "សំណើរបស់អ្នកត្រូវបានដំណើរការរួចរាល់។"
                };

            case 'th':
                return match ($toolName) {
                    'recommend_products' => $type === 'deals'
                        ? "นี่คือสินค้าโปรโมชั่นและลดราคาพิเศษค่ะ:"
                        : ($type === 'popular'
                            ? "นี่คือสินค้าขายดียอดนิยมของร้านเราค่ะ:"
                            : "นี่คือสินค้าที่คุณกำลังค้นหาค่ะ:"),
                    'search_products' => !empty($data['products'])
                        ? "นี่คือสินค้าที่คุณกำลังค้นหาค่ะ:"
                        : "ขออภัย ร้านของเราไม่มีสินค้านี้ค่ะ คุณต้องการค้นหาสินค้าอื่นเพิ่มเติมไหมคะ?",
                    'add_to_cart' => "✅ เพิ่มสินค้าลงในตะกร้าเรียบร้อยแล้วค่ะ ({$data['item_count']} รายการ, ยอดรวม \${$data['total']})",
                    'get_cart' => "🛒 ตะกร้าของคุณมี {$data['item_count']} รายการ (ยอดรวม \${$data['total']})",
                    'get_order_history' => !empty($data['orders'])
                        ? "นี่คือประวัติการสั่งซื้อของคุณค่ะ:"
                        : "กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ หรือระบุหมายเลขคำสั่งซื้อค่ะ",
                    'get_shipping_methods' => "🚚 เรามีบริการจัดส่งทั่วประเทศ 1-3 วันทำการค่ะ",
                    'get_payment_methods' => "💳 รองรับการชำระเงินผ่าน **KHQR**, **ABA PAY**, **บัตรเครดิต** และ **COD** ค่ะ",
                    'create_support_request' => "🎫 **ส่งคำขอรับบริการ (#{$data['ticket_id']})**\nเจ้าหน้าที่จะติดต่อกลับโดยเร็วค่ะ\n📞 Hotline: **+855 71 888 999**",
                    default => "ดำเนินการเรียบร้อยแล้วค่ะ"
                };

            case 'vi':
                return match ($toolName) {
                    'recommend_products' => $type === 'deals'
                        ? "Dưới đây là các sản phẩm đang có chương trình khuyến mãi giảm giá:"
                        : ($type === 'popular'
                            ? "Dưới đây là các sản phẩm bán chạy nhất:"
                            : "Dưới đây là các sản phẩm bạn tìm kiếm:"),
                    'search_products' => !empty($data['products'])
                        ? "Dưới đây là các sản phẩm bạn đang tìm kiếm:"
                        : "Xin lỗi, cửa hàng hiện không có sản phẩm này. Bạn có muốn tìm kiếm sản phẩm khác không?",
                    'add_to_cart' => "✅ Đã thêm sản phẩm vào giỏ hàng ({$data['item_count']} sản phẩm, \${$data['total']}).",
                    'get_cart' => "🛒 Giỏ hàng có {$data['item_count']} sản phẩm (Tổng: \${$data['total']}).",
                    'get_order_history' => !empty($data['orders'])
                        ? "Dưới đây là lịch sử đơn hàng của bạn:"
                        : "Vui lòng đăng nhập để xem lịch sử đơn hàng hoặc cung cấp mã đơn hàng.",
                    'get_shipping_methods' => "🚚 Chúng tôi giao hàng toàn quốc từ 1-3 ngày làm việc.",
                    'get_payment_methods' => "💳 Hỗ trợ thanh toán qua **KHQR**, **ABA PAY**, **Thẻ tín dụng** và **COD**.",
                    'create_support_request' => "🎫 **Yêu cầu hỗ trợ (#{$data['ticket_id']})**\nNhân viên hỗ trợ sẽ liên hệ với bạn sớm nhất.\n📞 Hotline: **+855 71 888 999**",
                    default => "Yêu cầu đã được xử lý."
                };

            case 'zh':
                return match ($toolName) {
                    'recommend_products' => $type === 'deals'
                        ? "这是商城当前的限时特惠与折扣商品："
                        : ($type === 'popular'
                            ? "这是商城当前的热销爆款商品："
                            : "这是为您找到的商品："),
                    'search_products' => !empty($data['products'])
                        ? "这是为您找到的商品："
                        : "抱歉，商城暂未找到该商品。您是否想查找其他商品？",
                    'add_to_cart' => "✅ 已成功加入购物车（共 {$data['item_count']} 件商品，总计 \${$data['total']}）。",
                    'get_cart' => "🛒 购物车中共有 {$data['item_count']} 件商品（总计 \${$data['total']}）。",
                    'get_order_history' => !empty($data['orders'])
                        ? "以下是您的历史订单："
                        : "请先登录账户以查看订单历史，或提供您的订单编号。",
                    'get_shipping_methods' => "🚚 我们支持全国配送（标准物流 1-3 天及同城极速达）。",
                    'get_payment_methods' => "💳 支持 **Bakong KHQR 扫码**、**ABA PAY**、**信用卡** 及 **货到付款 (COD)**。",
                    'create_support_request' => "🎫 **客服工单 (#{$data['ticket_id']})**\n专属客服将尽快跟进处理。\n📞 热线：**+855 71 888 999**",
                    default => "请求已成功处理。"
                };

            default: // English
                return match ($toolName) {
                    'recommend_products' => $type === 'deals'
                        ? "Here are the current promotional and discounted products:"
                        : ($type === 'popular'
                            ? "Here are our best-selling and popular products:"
                            : "Here are the products matching your search:"),

                    'search_products' => !empty($data['products'])
                        ? "Here are the products matching your search:"
                        : "Sorry, we don't have this product or service in our store. Would you like to search for something else?",

                    'get_product_details' => !empty($data['product'])
                        ? "**{$data['product']['name']}** (Price: \${$data['product']['price']}, Stock: " . ($data['product']['is_in_stock'] ? 'In Stock' : 'Out of Stock') . ", Rating: ⭐ {$data['product']['rating_avg']}/5):"
                        : "Sorry, details are unavailable for this product.",

                    'add_to_cart' => !empty($data['success'])
                        ? "✅ Added **" . ($data['added_product']['name'] ?? 'item') . "** to cart ({$data['item_count']} items, Total: \${$data['total']})."
                        : ($data['message'] ?? 'Could not add item to cart.'),

                    'get_cart' => !empty($data['items'])
                        ? "🛒 Your cart contains {$data['item_count']} item(s) (Total: \${$data['total']})."
                        : "🛒 Your shopping cart is empty.",

                    'clear_cart' => "🗑️ Your shopping cart has been cleared.",

                    'get_order_status' => !empty($data['found'])
                        ? "📦 **Order #{$data['order']['order_number']}** (Status: **" . strtoupper($data['order']['status']) . "**, Carrier: " . ($data['order']['shipping_carrier'] ?? 'Standard Delivery') . ", Tracking: `{$data['order']['tracking_number']}`)"
                        : "Sorry, order not found. Please verify your order number.",

                    'get_order_history' => !empty($data['orders'])
                        ? "Here is your order history:"
                        : "Please log in to your store account to view your past order history, or provide your order number (e.g. ORD-2026-XXXX).",

                    'get_shipping_methods' => "🚚 We offer nationwide delivery across all 25 provinces (Standard Delivery 1-3 days and Express).",

                    'get_payment_methods' => "💳 We accept **Bakong KHQR**, **ABA PAY**, **Visa/MasterCard**, and **Cash On Delivery (COD)**.",

                    'create_support_request' => "🎫 **Support Ticket (#{$data['ticket_id']})**\nOur team has received your request.\n📞 Hotline: **+855 71 888 999** / Telegram: **@EnterpriseShopBot**",

                    'search_faq' => "Here is the relevant store policy information:",

                    default => "Your request has been processed."
                };
        }
    }

    /**
     * Resolve conversation language from context or message history.
     */
    private function resolveLanguage(array $messages, array $context): string
    {
        // 1. Scan the latest user message directly for language
        $lastUserMsg = null;
        $reversed = array_reverse($messages);
        foreach ($reversed as $msg) {
            if (($msg['role'] ?? '') === 'user') {
                $lastUserMsg = $msg['content'] ?? '';
                break;
            }
        }

        if (!empty($lastUserMsg)) {
            // Khmer unicode range: U+1780 to U+17FF
            if (preg_match('/[\x{1780}-\x{17FF}]/u', $lastUserMsg)) {
                return 'km';
            }

            // Thai unicode range: U+0E00 to U+0E7F
            if (preg_match('/[\x{0E00}-\x{0E7F}]/u', $lastUserMsg)) {
                return 'th';
            }

            // Chinese unicode range: U+4E00 to U+9FFF
            if (preg_match('/[\x{4E00}-\x{9FFF}]/u', $lastUserMsg)) {
                return 'zh';
            }

            // Vietnamese specific accented characters
            if (preg_match('/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/iu', $lastUserMsg)) {
                return 'vi';
            }
        }

        // 2. Explicit language from request context (e.g. 'en', 'km', 'th', 'vi', 'zh')
        if (!empty($context['language']) && in_array($context['language'], ['en', 'km', 'th', 'vi', 'zh'])) {
            return $context['language'];
        }

        return 'en';
    }

    /**
     * Helper to match any keyword in text.
     */
    private function matchesAny(string $text, array $keywords): bool
    {
        foreach ($keywords as $kw) {
            if (str_contains($text, mb_strtolower($kw))) {
                return true;
            }
        }
        return false;
    }
}
