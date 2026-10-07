<?php

namespace App\Http\Controllers\Api\V1\Admin\Chatbot;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Chatbot\ChatSession;
use App\Models\Chatbot\ChatMessage;
use App\Models\Chatbot\TelegramUser;
use App\Models\Chatbot\ChatSupportRequest;
use App\Models\Setting\Setting;
use App\Services\Telegram\TelegramNotificationService;
use App\Services\Telegram\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminChatbotController extends BaseApiController
{
    public function __construct(
        private readonly TelegramNotificationService $telegramNotifier,
        private readonly TelegramService $telegramService
    ) {}

    /**
     * Chatbot analytics and KPI dashboard.
     * GET /api/v1/admin/chatbot/dashboard
     */
    public function dashboard(): JsonResponse
    {
        $totalSessions = ChatSession::count();
        $totalMessages = ChatMessage::count();
        $webSessions = ChatSession::where('channel', 'web')->count();
        $telegramSessions = ChatSession::where('channel', 'telegram')->count();
        $linkedTelegramUsers = TelegramUser::where('telegram_id', '>', 0)->whereNotNull('linked_at')->count();
        $pendingSupportRequests = ChatSupportRequest::where('status', 'pending')->count();
        $totalSupportRequests = ChatSupportRequest::count();

        // Tool execution breakdown
        $toolCallsCount = ChatMessage::where('role', 'tool')->count();
        $recentSessions = ChatSession::with(['customer', 'user'])
            ->latest('last_message_at')
            ->limit(8)
            ->get();

        return $this->successResponse([
            'metrics' => [
                'total_sessions'           => $totalSessions,
                'total_messages'           => $totalMessages,
                'web_sessions'             => $webSessions,
                'telegram_sessions'        => $telegramSessions,
                'linked_telegram_users'    => $linkedTelegramUsers,
                'pending_support_requests' => $pendingSupportRequests,
                'total_support_requests'   => $totalSupportRequests,
                'tool_calls_count'         => $toolCallsCount,
                'telegram_configured'      => $this->telegramService->isConfigured(),
            ],
            'recent_sessions' => $recentSessions,
        ]);
    }

    /**
     * List all chat sessions with filters.
     * GET /api/v1/admin/chatbot/sessions
     */
    public function sessions(Request $request): JsonResponse
    {
        $query = ChatSession::with(['customer', 'user'])
            ->withCount('messages');

        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('session_token', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $sessions = $query->latest('last_message_at')->paginate($request->input('per_page', 15));

        return $this->successResponse($sessions);
    }

    /**
     * Get single session transcript with all messages and tool executions.
     * GET /api/v1/admin/chatbot/sessions/{id}
     */
    public function showSession(int $id): JsonResponse
    {
        $session = ChatSession::with(['customer', 'user', 'messages'])->findOrFail($id);

        return $this->successResponse($session);
    }

    /**
     * List support requests / tickets.
     * GET /api/v1/admin/chatbot/support-requests
     */
    public function supportRequests(Request $request): JsonResponse
    {
        $query = ChatSupportRequest::with(['customer', 'user', 'order']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        $requests = $query->latest()->paginate($request->input('per_page', 15));

        return $this->successResponse($requests);
    }

    /**
     * Update support request status or add admin notes.
     * PUT /api/v1/admin/chatbot/support-requests/{id}
     */
    public function updateSupportRequest(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status'      => 'required|in:pending,in_progress,resolved,cancelled',
            'admin_notes' => 'nullable|string',
        ]);

        $ticket = ChatSupportRequest::findOrFail($id);
        $ticket->status = $validated['status'];
        if (isset($validated['admin_notes'])) {
            $ticket->admin_notes = $validated['admin_notes'];
        }
        if ($validated['status'] === 'resolved' && !$ticket->resolved_at) {
            $ticket->resolved_at = now();
        }
        $ticket->save();

        return $this->successResponse($ticket, 'Support request updated successfully');
    }

    /**
     * List linked Telegram users.
     * GET /api/v1/admin/chatbot/telegram-users
     */
    public function telegramUsers(Request $request): JsonResponse
    {
        $users = TelegramUser::with(['customer', 'user'])
            ->where('telegram_id', '>', 0)
            ->latest('linked_at')
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($users);
    }

    /**
     * Trigger test Telegram alert to verify bot notifications.
     * POST /api/v1/admin/chatbot/test-notification
     */
    public function testNotification(Request $request): JsonResponse
    {
        $type = $request->input('type', 'general');

        $result = match ($type) {
            'order' => $this->sendTestOrderAlert(),
            'stock' => $this->sendTestStockAlert(),
            default => $this->sendTestGeneralAlert(),
        };

        return $this->successResponse([
            'type'    => $type,
            'success' => $result,
            'message' => $result
                ? 'Test Telegram notification dispatched to Admin chat!'
                : 'Could not send Telegram message. Please ensure TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID are set.',
        ]);
    }

    private function sendTestGeneralAlert(): bool
    {
        $chatId = config('services.telegram.admin_chat_id') ?: env('TELEGRAM_ADMIN_CHAT_ID');
        if (!$chatId) return false;

        $text = "🔔 <b>ENTERPRISE POS TELEGRAM ALERT TEST</b>\n\n"
            . "Status: <b>ONLINE</b> ✅\n"
            . "Timestamp: " . now()->format('Y-m-d H:i:s') . "\n"
            . "System: AI Shopping Assistant & Multi-channel Bot Integration";

        $res = $this->telegramService->sendMessage($chatId, $text);
        return $res['ok'] ?? false;
    }

    private function sendTestOrderAlert(): bool
    {
        $chatId = config('services.telegram.admin_chat_id') ?: env('TELEGRAM_ADMIN_CHAT_ID');
        if (!$chatId) return false;

        $text = "🚨 <b>TEST: NEW ORDER RECEIVED</b>\n\n"
            . "📦 <b>Order:</b> <code>#ORD-TEST-999</code>\n"
            . "👤 <b>Customer:</b> John Doe (VIP Customer)\n"
            . "💵 <b>Subtotal:</b> \$850.00\n"
            . "🚚 <b>Shipping:</b> \$10.00\n"
            . "💰 <b>Total:</b> <b>\$860.00</b>\n"
            . "💳 <b>Payment:</b> Bakong KHQR (PAID)";

        $res = $this->telegramService->sendMessage($chatId, $text);
        return $res['ok'] ?? false;
    }

    private function sendTestStockAlert(): bool
    {
        $chatId = config('services.telegram.admin_chat_id') ?: env('TELEGRAM_ADMIN_CHAT_ID');
        if (!$chatId) return false;

        $text = "⚠️ <b>TEST: LOW STOCK ALERT</b>\n\n"
            . "📦 <b>Product:</b> Samsung Galaxy S24 Ultra\n"
            . "🏷️ <b>SKU:</b> <code>SM-S928B</code>\n"
            . "📊 <b>Remaining Stock:</b> <b>2 units</b>\n"
            . "📉 <b>Low Stock Threshold:</b> 5 units";

        $res = $this->telegramService->sendMessage($chatId, $text);
        return $res['ok'] ?? false;
    }
}
