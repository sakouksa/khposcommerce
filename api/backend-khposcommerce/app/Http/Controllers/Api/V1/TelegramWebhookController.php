<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Telegram\TelegramBotHandler;
use App\Services\Telegram\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends BaseApiController
{
    public function __construct(
        private readonly TelegramBotHandler $botHandler,
        private readonly TelegramService $telegramService
    ) {}

    /**
     * Receive incoming webhook updates from Telegram Bot API.
     * POST /api/v1/telegram/webhook
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        // Optional secret token verification
        $secret = config('services.telegram.webhook_secret') ?: env('TELEGRAM_WEBHOOK_SECRET');
        if ($secret) {
            $headerSecret = $request->header('X-Telegram-Bot-Api-Secret-Token');
            if ($headerSecret !== $secret) {
                Log::warning("Unauthorized Telegram webhook attempt with invalid secret token.");
                return response()->json(['ok' => false, 'error' => 'UNAUTHORIZED'], 403);
            }
        }

        $update = $request->all();

        try {
            $this->botHandler->handleUpdate($update);
        } catch (\Throwable $e) {
            Log::error("Error handling Telegram update: " . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
                'payload'   => $update,
            ]);
        }

        // Always acknowledge Telegram webhook with 200 OK
        return response()->json(['ok' => true]);
    }

    /**
     * Admin utility endpoint to register or check webhook with Telegram API.
     * POST /api/v1/telegram/setup-webhook
     */
    public function setupWebhook(Request $request): JsonResponse
    {
        $appUrl = config('app.url') ?? env('APP_URL') ?? 'https://example.com';
        $webhookUrl = $request->input('webhook_url') ?? "{$appUrl}/api/v1/telegram/webhook";
        $secret = config('services.telegram.webhook_secret') ?: env('TELEGRAM_WEBHOOK_SECRET');

        $result = $this->telegramService->setWebhook($webhookUrl, $secret);

        return $this->successResponse($result, 'Telegram webhook registration result');
    }

    /**
     * Check current Telegram webhook status.
     * GET /api/v1/telegram/webhook-info
     */
    public function webhookInfo(): JsonResponse
    {
        $info = $this->telegramService->getWebhookInfo();
        return $this->successResponse($info);
    }
}
