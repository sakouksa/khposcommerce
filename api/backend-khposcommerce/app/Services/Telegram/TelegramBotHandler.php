<?php

namespace App\Services\Telegram;

use App\Models\Chatbot\TelegramUser;
use App\Models\Customer\Customer;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Services\Chatbot\ChatService;
use App\Services\Chatbot\Tools\CartTool;
use App\Services\Chatbot\Tools\OrderTool;
use App\Services\Chatbot\Tools\ProductTool;
use Illuminate\Support\Facades\Log;

class TelegramBotHandler
{
    public function __construct(
        private readonly TelegramService $telegramService,
        private readonly ChatService $chatService,
        private readonly ProductTool $productTool,
        private readonly CartTool $cartTool,
        private readonly OrderTool $orderTool
    ) {}

    /**
     * Main entry point to handle incoming Telegram update webhook payload.
     */
    public function handleUpdate(array $update): void
    {
        // 1. Handle Callback Queries (Inline Button clicks)
        if (!empty($update['callback_query'])) {
            $this->handleCallbackQuery($update['callback_query']);
            return;
        }

        // 2. Handle Message
        if (!empty($update['message'])) {
            $this->handleMessage($update['message']);
        }
    }

    /**
     * Handle incoming text message.
     */
    protected function handleMessage(array $message): void
    {
        $chatId = $message['chat']['id'] ?? null;
        if (!$chatId) return;

        $from = $message['from'] ?? [];
        $text = trim($message['text'] ?? '');

        // Resolve or create Telegram user
        $telegramUser = $this->resolveTelegramUser($chatId, $from);

        if ($text === '') {
            $this->telegramService->sendMessage($chatId, "Hello! Please send a text message or select a menu option.");
            return;
        }

        // Handle Commands
        if (str_starts_with($text, '/')) {
            $parts = explode(' ', $text, 2);
            $command = strtolower($parts[0]);
            $argument = trim($parts[1] ?? '');

            switch ($command) {
                case '/start':
                    $this->handleStartCommand($chatId, $telegramUser, $from);
                    return;

                case '/help':
                    $this->handleHelpCommand($chatId);
                    return;

                case '/products':
                    $this->handleProductsCommand($chatId);
                    return;

                case '/categories':
                    $this->handleCategoriesCommand($chatId);
                    return;

                case '/cart':
                    $this->handleCartCommand($chatId, $telegramUser);
                    return;

                case '/orders':
                    $this->handleOrdersCommand($chatId, $telegramUser);
                    return;

                case '/support':
                    $this->handleSupportCommand($chatId, $telegramUser);
                    return;

                case '/link':
                    $this->handleLinkCommand($chatId, $telegramUser, $argument);
                    return;
            }
        }

        // Natural Language Processing via AI ChatService
        $this->processAiMessage($chatId, $text, $telegramUser);
    }

    /**
     * Process message through unified AI ChatService.
     */
    protected function processAiMessage(int|string $chatId, string $text, TelegramUser $telegramUser): void
    {
        $sessionToken = "tg_{$chatId}";
        $customer = $telegramUser->customer;

        $response = $this->chatService->sendMessage(
            messageText: $text,
            channel: 'telegram',
            sessionToken: $sessionToken,
            customer: $customer
        );

        $replyText = $response['content'] ?? 'I have processed your request.';
        $metadata = $response['metadata'] ?? [];

        // Build interactive Telegram inline keyboard from AI response
        $inlineButtons = [];

        if (!empty($metadata['products'])) {
            foreach (array_slice($metadata['products'], 0, 3) as $p) {
                $inlineButtons[] = [
                    ['text' => "🛒 Add {$p['name']} (\${$p['price']})", 'callback_data' => "add_cart:{$p['id']}"],
                ];
            }
        }

        if (!empty($metadata['cart'])) {
            $inlineButtons[] = [
                ['text' => '🛍️ View Full Cart', 'callback_data' => 'view_cart'],
                ['text' => '🗑️ Clear Cart', 'callback_data' => 'clear_cart'],
            ];
        }

        if (!empty($metadata['order'])) {
            $orderNum = $metadata['order']['order_number'];
            $inlineButtons[] = [
                ['text' => "📦 Track #{$orderNum}", 'callback_data' => "track:{$orderNum}"],
            ];
        }

        // Add standard navigation buttons
        $inlineButtons[] = [
            ['text' => '🔎 Products', 'callback_data' => 'cmd_products'],
            ['text' => '🛒 Cart', 'callback_data' => 'cmd_cart'],
            ['text' => '💬 Support', 'callback_data' => 'cmd_support'],
        ];

        $replyMarkup = ['inline_keyboard' => $inlineButtons];

        $this->telegramService->sendMessage($chatId, $this->formatForTelegram($replyText), $replyMarkup);
    }

    /**
     * Handle `/start` command.
     */
    protected function handleStartCommand(int|string $chatId, TelegramUser $telegramUser, array $from): void
    {
        $name = htmlspecialchars($from['first_name'] ?? 'Friend');
        $isLinked = $telegramUser->isLinked();

        $text = "👋 <b>Hello, {$name}! Welcome to Enterprise Shop Bot!</b> 🤖\n\n"
            . "I am your personal AI shopping assistant. You can search products, check stock, manage your cart, and track orders directly here!\n\n"
            . ($isLinked
                ? "✅ <b>Account Linked:</b> Connected to <i>{$telegramUser->customer->name}</i>"
                : "💡 <i>Link your website account anytime using</i> <code>/link &lt;CODE&gt;</code>")
            . "\n\n<b>How can I help you today?</b>";

        $replyMarkup = [
            'inline_keyboard' => [
                [
                    ['text' => '🔎 Browse Products', 'callback_data' => 'cmd_products'],
                    ['text' => '🔥 Deals & Specials', 'callback_data' => 'cmd_deals'],
                ],
                [
                    ['text' => '🛒 View My Cart', 'callback_data' => 'cmd_cart'],
                    ['text' => '📦 Track Order', 'callback_data' => 'cmd_orders'],
                ],
                [
                    ['text' => '🔗 Link Web Account', 'callback_data' => 'cmd_link_info'],
                    ['text' => '💬 Human Support', 'callback_data' => 'cmd_support'],
                ],
            ],
        ];

        $this->telegramService->sendMessage($chatId, $text, $replyMarkup);
    }

    /**
     * Handle `/help` command.
     */
    protected function handleHelpCommand(int|string $chatId): void
    {
        $text = "📖 <b>Telegram Bot Commands & Features</b>\n\n"
            . "• /start - Launch bot & show main menu\n"
            . "• /products - View featured & popular products\n"
            . "• /categories - Explore product categories\n"
            . "• /cart - View items in your shopping cart\n"
            . "• /orders - View your recent order history\n"
            . "• /link <code> - Connect your website customer account\n"
            . "• /support - Escalate to human support agents\n\n"
            . "💬 <i>Or simply type any question in natural language (e.g. \"I need an iPhone under $800\", \"Where is ORD-1025?\", \"What is your return policy?\")</i>";

        $this->telegramService->sendMessage($chatId, $text);
    }

    /**
     * Handle `/products` command.
     */
    protected function handleProductsCommand(int|string $chatId): void
    {
        $result = $this->productTool->recommendProducts(['type' => 'featured', 'limit' => 4]);
        $products = $result['products'] ?? [];

        if (empty($products)) {
            $this->telegramService->sendMessage($chatId, "No products currently available.");
            return;
        }

        $text = "📱 <b>Featured Products:</b>\n\n";
        $buttons = [];

        foreach ($products as $idx => $p) {
            $stockStatus = $p['in_stock'] ? 'In Stock' : 'Out of Stock';
            $num = $idx + 1;
            $text .= "<b>{$num}. {$p['name']}</b>\n"
                . "💰 \${$p['price']}\n"
                . "📦 {$stockStatus}\n\n";

            $buttons[] = [
                ['text' => "🛒 Add {$p['name']} (\${$p['price']})", 'callback_data' => "add_cart:{$p['id']}"],
            ];
        }

        $buttons[] = [
            ['text' => '🛒 View Cart', 'callback_data' => 'cmd_cart'],
            ['text' => '🔎 Search More', 'callback_data' => 'cmd_products'],
        ];

        $this->telegramService->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    /**
     * Handle `/categories` command.
     */
    protected function handleCategoriesCommand(int|string $chatId): void
    {
        $categories = Category::where('is_active', true)->limit(8)->get();
        if ($categories->isEmpty()) {
            $this->telegramService->sendMessage($chatId, "No categories available at this moment.");
            return;
        }

        $text = "📂 <b>Product Categories:</b>\n\n";
        $buttons = [];
        $row = [];

        foreach ($categories as $cat) {
            $row[] = ['text' => $cat->name, 'callback_data' => "search_cat:{$cat->slug}"];
            if (count($row) === 2) {
                $buttons[] = $row;
                $row = [];
            }
        }
        if (!empty($row)) {
            $buttons[] = $row;
        }

        $this->telegramService->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    /**
     * Handle `/cart` command.
     */
    protected function handleCartCommand(int|string $chatId, TelegramUser $telegramUser): void
    {
        $context = [
            'session_token' => "tg_{$chatId}",
            'customer_id'   => $telegramUser->customer_id,
        ];

        $cart = $this->cartTool->getCart([], $context);
        $items = $cart['items'] ?? [];

        if (empty($items)) {
            $text = "🛒 <b>Your shopping cart is currently empty!</b>\n\nBrowse our products with /products or type what you are looking for.";
            $buttons = [
                [['text' => '🔎 Browse Products', 'callback_data' => 'cmd_products']],
            ];
            $this->telegramService->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
            return;
        }

        $text = "🛒 <b>Your Shopping Cart:</b>\n\n";
        foreach ($items as $item) {
            $text .= "• <b>{$item['name']}</b> × {$item['quantity']} = <b>\${$item['subtotal']}</b>\n";
        }
        $text .= "\n💵 <b>Total Amount: \${$cart['total']}</b> ({$cart['item_count']} items)";

        $buttons = [
            [
                ['text' => '🗑️ Clear Cart', 'callback_data' => 'clear_cart'],
                ['text' => '🔎 Add More Items', 'callback_data' => 'cmd_products'],
            ],
        ];

        $this->telegramService->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    /**
     * Handle `/orders` command.
     */
    protected function handleOrdersCommand(int|string $chatId, TelegramUser $telegramUser): void
    {
        if (!$telegramUser->isLinked()) {
            $text = "🔒 <b>Account Not Linked</b>\n\n"
                . "To view your order history, please link your website account:\n"
                . "1. Go to our website account settings.\n"
                . "2. Click <b>'Link Telegram'</b> to get your 6-digit code.\n"
                . "3. Type <code>/link &lt;CODE&gt;</code> here.\n\n"
                . "<i>Or you can track a specific order by typing:</i> <code>track ORD-XXXX</code>";

            $this->telegramService->sendMessage($chatId, $text);
            return;
        }

        $context = ['customer_id' => $telegramUser->customer_id];
        $result = $this->orderTool->getOrderHistory(['limit' => 5], $context);
        $orders = $result['orders'] ?? [];

        if (empty($orders)) {
            $this->telegramService->sendMessage($chatId, "📦 You have no past orders in your account.");
            return;
        }

        $text = "📦 <b>Your Recent Orders:</b>\n\n";
        $buttons = [];

        foreach ($orders as $order) {
            $text .= "• <b>Order #{$order['order_number']}</b>\n"
                . "  Status: <b>" . strtoupper($order['status']) . "</b> | \${$order['grand_total']}\n"
                . "  Date: {$order['created_at']}\n\n";

            $buttons[] = [
                ['text' => "🔍 Track #{$order['order_number']}", 'callback_data' => "track:{$order['order_number']}"],
            ];
        }

        $this->telegramService->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    /**
     * Handle `/support` command.
     */
    protected function handleSupportCommand(int|string $chatId, TelegramUser $telegramUser): void
    {
        $context = [
            'channel'          => 'telegram',
            'chat_session_id'  => null,
            'customer_id'      => $telegramUser->customer_id,
            'user_name'        => $telegramUser->full_name,
            'phone_or_email'   => $telegramUser->customer?->phone ?? "@{$telegramUser->username}",
        ];

        $res = $this->chatService->sendMessage(
            messageText: 'I need human support assistance',
            channel: 'telegram',
            sessionToken: "tg_{$chatId}",
            customer: $telegramUser->customer
        );

        $this->telegramService->sendMessage($chatId, $this->formatForTelegram($res['content']));
    }

    /**
     * Handle `/link <code>` command.
     */
    protected function handleLinkCommand(int|string $chatId, TelegramUser $telegramUser, string $code): void
    {
        if (empty($code)) {
            $this->telegramService->sendMessage($chatId, "Please provide your 6-digit link code. Example: <code>/link 123456</code>");
            return;
        }

        $code = trim($code);

        // Find customer with active link code
        $matchingUser = TelegramUser::where('link_code', $code)
            ->where('link_code_expires_at', '>', now())
            ->first();

        if (!$matchingUser || !$matchingUser->customer_id) {
            $this->telegramService->sendMessage($chatId, "❌ <b>Invalid or expired link code.</b>\nPlease generate a new code from the website.");
            return;
        }

        // Link the telegram record
        $telegramUser->customer_id = $matchingUser->customer_id;
        $telegramUser->user_id = $matchingUser->user_id;
        $telegramUser->linked_at = now();
        $telegramUser->link_code = null;
        $telegramUser->link_code_expires_at = null;
        $telegramUser->save();

        // Clear temporary placeholder if different
        if ($matchingUser->id !== $telegramUser->id && $matchingUser->telegram_id <= 0) {
            $matchingUser->delete();
        }

        $customerName = htmlspecialchars($telegramUser->customer?->name ?? 'Valued Customer');
        $text = "🎉 <b>Account Linked Successfully!</b>\n\n"
            . "Your Telegram is now connected to <b>{$customerName}</b>.\n"
            . "You can now check your orders with /orders, access your synced cart, and receive instant delivery updates!";

        $this->telegramService->sendMessage($chatId, $text);
    }

    /**
     * Handle Callback Query (Inline Button Click).
     */
    protected function handleCallbackQuery(array $callbackQuery): void
    {
        $callbackId = $callbackQuery['id'] ?? '';
        $data = $callbackQuery['data'] ?? '';
        $chatId = $callbackQuery['message']['chat']['id'] ?? null;
        $from = $callbackQuery['from'] ?? [];

        if (!$chatId) return;

        $telegramUser = $this->resolveTelegramUser($chatId, $from);

        $this->telegramService->answerCallbackQuery($callbackId);

        if (str_starts_with($data, 'add_cart:')) {
            $productId = (int) substr($data, 9);
            $context = [
                'session_token' => "tg_{$chatId}",
                'customer_id'   => $telegramUser->customer_id,
            ];
            $res = $this->cartTool->addToCart(['product_id' => $productId, 'quantity' => 1], $context);

            $this->telegramService->sendMessage(
                $chatId,
                $res['success']
                    ? "✅ <b>{$res['added_product']['name']}</b> added to your cart!\nTotal: \${$res['total']} ({$res['item_count']} items)"
                    : "❌ Could not add item: " . ($res['message'] ?? 'Error')
            );
            return;
        }

        if ($data === 'cmd_cart' || $data === 'view_cart') {
            $this->handleCartCommand($chatId, $telegramUser);
            return;
        }

        if ($data === 'clear_cart') {
            $context = ['session_token' => "tg_{$chatId}", 'customer_id' => $telegramUser->customer_id];
            $this->cartTool->clearCart([], $context);
            $this->telegramService->sendMessage($chatId, "🗑️ <b>Your cart has been cleared.</b>");
            return;
        }

        if ($data === 'cmd_products') {
            $this->handleProductsCommand($chatId);
            return;
        }

        if ($data === 'cmd_orders') {
            $this->handleOrdersCommand($chatId, $telegramUser);
            return;
        }

        if ($data === 'cmd_support') {
            $this->handleSupportCommand($chatId, $telegramUser);
            return;
        }

        if ($data === 'cmd_deals') {
            $this->processAiMessage($chatId, 'Show me deals and discounts', $telegramUser);
            return;
        }

        if (str_starts_with($data, 'track:')) {
            $orderNumber = substr($data, 6);
            $this->processAiMessage($chatId, "Track order {$orderNumber}", $telegramUser);
            return;
        }

        if (str_starts_with($data, 'search_cat:')) {
            $catSlug = substr($data, 11);
            $this->processAiMessage($chatId, "Show products in category {$catSlug}", $telegramUser);
            return;
        }
    }

    /**
     * Resolve or persist TelegramUser.
     */
    protected function resolveTelegramUser(int|string $telegramId, array $from): TelegramUser
    {
        return TelegramUser::firstOrCreate(
            ['telegram_id' => $telegramId],
            [
                'username'   => $from['username'] ?? null,
                'first_name' => $from['first_name'] ?? null,
                'last_name'  => $from['last_name'] ?? null,
                'is_active'  => true,
            ]
        );
    }

    /**
     * Convert markdown text to clean HTML supported by Telegram.
     */
    protected function formatForTelegram(string $text): string
    {
        // Replace bold **text** with <b>text</b>
        $formatted = preg_replace('/\*\*(.*?)\*\*/s', '<b>$1</b>', $text);
        // Replace `code` with <code>code</code>
        $formatted = preg_replace('/`([^`]+)`/', '<code>$1</code>', $formatted);
        return $formatted;
    }
}
