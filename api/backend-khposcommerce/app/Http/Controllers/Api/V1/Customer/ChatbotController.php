<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Chatbot\TelegramUser;
use App\Models\Customer\Customer;
use App\Models\Chatbot\ChatSupportRequest;
use App\Services\Chatbot\ChatService;
use App\Services\Telegram\TelegramNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatbotController extends BaseApiController
{
    public function __construct(
        private readonly ChatService $chatService,
        private readonly TelegramNotificationService $telegramNotifier
    ) {}

    /**
     * Send message to the AI Chatbot.
     * POST /api/v1/customer/chat/message or /api/chat/message
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message'       => 'required|string|max:1000',
            'session_token' => 'nullable|string|max:100',
            'language'      => 'nullable|string|max:10',
        ]);

        $user = $request->user();
        $customer = null;
        if ($user) {
            $customer = Customer::where('user_id', $user->id)->first();
        }

        $sessionToken = $validated['session_token']
            ?? $request->header('X-Session-ID')
            ?? ($customer ? "cust_{$customer->id}" : 'guest_' . Str::random(16));

        $language = $validated['language']
            ?? $request->header('X-Language')
            ?? null;

        try {
            $response = $this->chatService->sendMessage(
                messageText: $validated['message'],
                channel: 'web',
                sessionToken: $sessionToken,
                user: $user,
                customer: $customer,
                language: $language
            );

            return $this->successResponse($response, 'Response generated');
        } catch (\Throwable $e) {
            return $this->errorResponse('Sorry, I encountered an issue processing your request. Please try again or contact support.', [
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get chat conversation history.
     * GET /api/v1/customer/chat/history
     */
    public function getHistory(Request $request): JsonResponse
    {
        $sessionToken = $request->input('session_token') ?? $request->header('X-Session-ID');
        if (!$sessionToken) {
            return $this->successResponse([], 'No history');
        }

        $history = $this->chatService->getHistory($sessionToken, 'web');
        return $this->successResponse($history);
    }

    /**
     * Clear chat conversation history.
     * DELETE /api/v1/customer/chat/history
     */
    public function clearHistory(Request $request): JsonResponse
    {
        $sessionToken = $request->input('session_token') ?? $request->header('X-Session-ID');
        if (!$sessionToken) {
            return $this->errorResponse('Session token required', null, 400);
        }

        $cleared = $this->chatService->clearHistory($sessionToken, 'web');
        return $this->successResponse(['cleared' => $cleared], 'Chat history cleared');
    }

    /**
     * Create direct Human Support Request.
     * POST /api/v1/customer/chat/support
     */
    public function createSupportRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message'       => 'required|string|max:2000',
            'subject'       => 'nullable|string|max:255',
            'order_id'      => 'nullable|integer|exists:orders,id',
            'contact_info'  => 'nullable|string|max:255',
            'customer_name' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $customer = $user ? Customer::where('user_id', $user->id)->first() : null;

        $supportRequest = ChatSupportRequest::create([
            'customer_id'      => $customer?->id,
            'user_id'          => $user?->id,
            'order_id'         => $validated['order_id'] ?? null,
            'channel'          => 'web',
            'customer_name'    => $validated['customer_name'] ?? $customer?->name ?? $user?->name ?? 'Guest User',
            'customer_contact' => $validated['contact_info'] ?? $customer?->email ?? $customer?->phone ?? 'Web Chat',
            'subject'          => $validated['subject'] ?? 'Website Customer Support Inquiry',
            'message'          => $validated['message'],
            'status'           => 'pending',
        ]);

        // Dispatch instant Telegram notification to staff
        $this->telegramNotifier->sendSupportEscalationAlert($supportRequest);

        return $this->successResponse([
            'ticket_id' => 'TKT-' . str_pad($supportRequest->id, 5, '0', STR_PAD_LEFT),
            'status'    => 'pending',
            'message'   => 'Your support inquiry has been received. Our team will contact you shortly.',
        ], 'Support request submitted successfully', 201);
    }

    /**
     * Generate 6-digit link code for Telegram linking.
     * POST /api/v1/customer/telegram/link-code
     */
    public function generateTelegramLinkCode(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->errorResponse('Authentication required to link Telegram.', null, 401);
        }

        $customer = Customer::where('user_id', $user->id)->first();
        if (!$customer) {
            return $this->errorResponse('Customer profile not found.', null, 404);
        }

        // Generate 6-digit numeric code
        $code = (string) random_int(100000, 999999);
        $expiresAt = now()->addMinutes(15);

        // Check if existing telegram user record exists for customer
        $telegramUser = TelegramUser::where('customer_id', $customer->id)->first();

        if ($telegramUser) {
            $telegramUser->link_code = $code;
            $telegramUser->link_code_expires_at = $expiresAt;
            $telegramUser->save();
        } else {
            TelegramUser::create([
                'user_id'              => $user->id,
                'customer_id'          => $customer->id,
                'telegram_id'          => -1 * $customer->id, // placeholder until bot receives /link
                'link_code'            => $code,
                'link_code_expires_at' => $expiresAt,
            ]);
        }

        $botUsername = config('services.telegram.bot_username') ?: 'EnterpriseShopBot';

        return $this->successResponse([
            'link_code'    => $code,
            'expires_at'   => $expiresAt->toIso8601String(),
            'bot_username' => $botUsername,
            'bot_url'      => "https://t.me/{$botUsername}?start=link_{$code}",
            'instructions' => "Open @{$botUsername} in Telegram and send `/link {$code}` within 15 minutes.",
        ], 'Telegram link code generated');
    }

    /**
     * Check Telegram linking status for authenticated customer.
     * GET /api/v1/customer/telegram/status
     */
    public function getTelegramStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->successResponse(['is_linked' => false]);
        }

        $customer = Customer::where('user_id', $user->id)->first();
        if (!$customer) {
            return $this->successResponse(['is_linked' => false]);
        }

        $telegramUser = TelegramUser::where('customer_id', $customer->id)
            ->where('telegram_id', '>', 0)
            ->whereNotNull('linked_at')
            ->first();

        return $this->successResponse([
            'is_linked'    => (bool) $telegramUser,
            'username'     => $telegramUser?->username,
            'first_name'   => $telegramUser?->first_name,
            'linked_at'    => $telegramUser?->linked_at?->toIso8601String(),
            'bot_username' => config('services.telegram.bot_username') ?: 'EnterpriseShopBot',
        ]);
    }

    /**
     * Unlink Telegram account.
     * DELETE /api/v1/customer/telegram/unlink
     */
    public function unlinkTelegram(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->errorResponse('Authentication required', null, 401);
        }

        $customer = Customer::where('user_id', $user->id)->first();
        if ($customer) {
            TelegramUser::where('customer_id', $customer->id)->delete();
        }

        return $this->successResponse(['unlinked' => true], 'Telegram account unlinked successfully');
    }
}
