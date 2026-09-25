<?php

namespace App\Services\Telegram;

use App\Models\Order\Order;
use App\Models\Payment\Payment;
use App\Models\Product\Product;
use App\Models\Customer\Customer;
use App\Models\Chatbot\ChatSupportRequest;
use Illuminate\Support\Facades\Log;

class TelegramNotificationService
{
    private ?string $adminChatId;

    public function __construct(
        private readonly TelegramService $telegramService
    ) {
        $this->adminChatId = config('services.telegram.admin_chat_id') ?: env('TELEGRAM_ADMIN_CHAT_ID');
    }

    /**
     * Send New Order Notification to Admin.
     */
    public function sendNewOrderAlert(Order $order): bool
    {
        if (!$this->adminChatId) return false;

        $itemsSummary = '';
        foreach ($order->items as $item) {
            $itemsSummary .= "• <b>{$item->product_name}</b> × " . (float)$item->quantity . " (\${$item->total})\n";
        }

        $customerName = htmlspecialchars($order->shipping_name ?? $order->customer?->name ?? 'Guest Customer');
        $phone = htmlspecialchars($order->shipping_phone ?? $order->customer?->phone ?? 'N/A');

        $text = "🚨 <b>NEW ORDER RECEIVED!</b>\n\n"
            . "📦 <b>Order:</b> <code>#{$order->order_number}</code>\n"
            . "👤 <b>Customer:</b> {$customerName}\n"
            . "📞 <b>Phone:</b> {$phone}\n\n"
            . "<b>Items:</b>\n{$itemsSummary}\n"
            . "💵 <b>Subtotal:</b> \${$order->subtotal}\n"
            . "🚚 <b>Shipping:</b> \${$order->shipping_cost}\n"
            . "💰 <b>Grand Total:</b> <b>\${$order->grand_total}</b>\n"
            . "💳 <b>Payment Status:</b> " . strtoupper($order->payment_status) . "\n"
            . "📍 <b>Destination:</b> " . htmlspecialchars($order->shipping_city ?? 'Standard');

        $replyMarkup = [
            'inline_keyboard' => [
                [
                    ['text' => '📄 View Order Details', 'url' => (config('app.url') ?? 'http://localhost') . "/orders/{$order->id}"],
                ],
            ],
        ];

        $res = $this->telegramService->sendMessage($this->adminChatId, $text, $replyMarkup);
        return $res['ok'] ?? false;
    }

    /**
     * Send Payment Success Notification.
     */
    public function sendPaymentSuccessAlert(Payment $payment, ?Order $order = null): bool
    {
        if (!$this->adminChatId) return false;

        $orderNumber = $order ? $order->order_number : ($payment->payable_id ?? 'N/A');
        $method = $payment->paymentMethod?->name ?? 'Online Banking';

        $text = "💳 <b>PAYMENT CONFIRMED!</b>\n\n"
            . "📦 <b>Order:</b> <code>#{$orderNumber}</code>\n"
            . "💵 <b>Amount Paid:</b> <b>\${$payment->amount} {$payment->currency_code}</b>\n"
            . "🏦 <b>Method:</b> {$method}\n"
            . "🔢 <b>Transaction ID:</b> <code>" . ($payment->transaction_id ?? $payment->reference_number ?? 'N/A') . "</code>\n"
            . "🕒 <b>Time:</b> " . now()->format('Y-m-d H:i:s');

        $res = $this->telegramService->sendMessage($this->adminChatId, $text);
        return $res['ok'] ?? false;
    }

    /**
     * Send Low Stock Alert.
     */
    public function sendLowStockAlert(Product $product, float $currentStock): bool
    {
        if (!$this->adminChatId) return false;

        $text = "⚠️ <b>LOW STOCK WARNING!</b>\n\n"
            . "📦 <b>Product:</b> " . htmlspecialchars($product->name) . "\n"
            . "🏷️ <b>SKU:</b> <code>{$product->sku}</code>\n"
            . "📊 <b>Remaining Stock:</b> <b>{$currentStock} units</b>\n"
            . "📉 <b>Threshold:</b> {$product->low_stock_threshold} units\n\n"
            . "👉 <i>Please create a purchase order or restock warehouse.</i>";

        $res = $this->telegramService->sendMessage($this->adminChatId, $text);
        return $res['ok'] ?? false;
    }

    /**
     * Send Order Shipped Alert.
     */
    public function sendOrderShippedAlert(Order $order): bool
    {
        if (!$this->adminChatId) return false;

        $shipment = $order->shipment;
        $carrier = $shipment?->carrier ?? $order->shippingMethod?->name ?? 'Standard Delivery';
        $tracking = $shipment?->tracking_number ?? 'Pending Dispatch';

        $text = "🚚 <b>ORDER SHIPPED!</b>\n\n"
            . "📦 <b>Order:</b> <code>#{$order->order_number}</code>\n"
            . "👤 <b>Customer:</b> " . htmlspecialchars($order->shipping_name ?? $order->customer?->name ?? '') . "\n"
            . "🚛 <b>Carrier:</b> {$carrier}\n"
            . "🔖 <b>Tracking #:</b> <code>{$tracking}</code>\n"
            . "📍 <b>Destination:</b> " . htmlspecialchars($order->shipping_city ?? 'Standard');

        $res = $this->telegramService->sendMessage($this->adminChatId, $text);
        return $res['ok'] ?? false;
    }

    /**
     * Send Support Escalation Alert.
     */
    public function sendSupportEscalationAlert(ChatSupportRequest $supportRequest): bool
    {
        if (!$this->adminChatId) return false;

        $text = "🤖 <b>CUSTOMER SUPPORT ESCALATION!</b>\n\n"
            . "🎫 <b>Ticket:</b> <code>TKT-" . str_pad($supportRequest->id, 5, '0', STR_PAD_LEFT) . "</code>\n"
            . "👤 <b>Customer:</b> " . htmlspecialchars($supportRequest->customer_name ?? 'Visitor') . "\n"
            . "📞 <b>Contact:</b> " . htmlspecialchars($supportRequest->customer_contact ?? 'N/A') . "\n"
            . "📱 <b>Channel:</b> " . strtoupper($supportRequest->channel) . "\n\n"
            . "📝 <b>Question / Issue:</b>\n"
            . "<i>\"" . htmlspecialchars($supportRequest->message) . "\"</i>\n\n"
            . "🕒 <b>Escalated At:</b> " . now()->format('Y-m-d H:i:s');

        $replyMarkup = [
            'inline_keyboard' => [
                [
                    ['text' => '👤 Open in Admin CRM', 'url' => (config('app.url') ?? 'http://localhost') . "/support/{$supportRequest->id}"],
                ],
            ],
        ];

        $res = $this->telegramService->sendMessage($this->adminChatId, $text, $replyMarkup);
        return $res['ok'] ?? false;
    }

    /**
     * Send New Customer Registration Alert.
     */
    public function sendNewCustomerAlert(Customer $customer): bool
    {
        if (!$this->adminChatId) return false;

        $text = "👤 <b>NEW CUSTOMER REGISTERED!</b>\n\n"
            . "📛 <b>Name:</b> " . htmlspecialchars($customer->name) . "\n"
            . "📧 <b>Email:</b> " . htmlspecialchars($customer->email ?? 'N/A') . "\n"
            . "📞 <b>Phone:</b> " . htmlspecialchars($customer->phone ?? 'N/A') . "\n"
            . "🕒 <b>Registered:</b> " . now()->format('Y-m-d H:i:s');

        $res = $this->telegramService->sendMessage($this->adminChatId, $text);
        return $res['ok'] ?? false;
    }

    /**
     * Send System Error Alert.
     */
    public function sendSystemErrorAlert(string $error, array $context = []): bool
    {
        if (!$this->adminChatId) return false;

        $text = "⚠️ <b>SYSTEM EXCEPTION ALERT!</b>\n\n"
            . "❌ <b>Error:</b> <code>" . htmlspecialchars(mb_substr($error, 0, 400)) . "</code>\n"
            . "🕒 <b>Time:</b> " . now()->format('Y-m-d H:i:s');

        $res = $this->telegramService->sendMessage($this->adminChatId, $text);
        return $res['ok'] ?? false;
    }
}
