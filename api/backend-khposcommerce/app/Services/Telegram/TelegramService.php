<?php

namespace App\Services\Telegram;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private ?string $botToken;
    private string $baseUrl;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token') ?: env('TELEGRAM_BOT_TOKEN');
        $this->baseUrl = "https://api.telegram.org/bot{$this->botToken}";
    }

    public function isConfigured(): bool
    {
        return !empty($this->botToken) && $this->botToken !== 'your-telegram-bot-token';
    }

    /**
     * Send text message to a chat.
     */
    public function sendMessage(
        int|string $chatId,
        string $text,
        ?array $replyMarkup = null,
        string $parseMode = 'HTML'
    ): array {
        if (!$this->isConfigured()) {
            Log::info("[Mock Telegram] sendMessage to {$chatId}: " . strip_tags($text));
            return ['ok' => true, 'mock' => true];
        }

        $payload = [
            'chat_id'    => $chatId,
            'text'       => $text,
            'parse_mode' => $parseMode,
        ];

        if ($replyMarkup) {
            $payload['reply_markup'] = json_encode($replyMarkup);
        }

        try {
            $response = Http::timeout(10)->post("{$this->baseUrl}/sendMessage", $payload);
            return $response->json() ?? ['ok' => false];
        } catch (\Throwable $e) {
            Log::error("Telegram sendMessage error: " . $e->getMessage());
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send photo with caption (supports both web URLs and local disk files).
     */
    public function sendPhoto(
        int|string $chatId,
        string $photoUrl,
        string $caption = '',
        ?array $replyMarkup = null
    ): array {
        if (!$this->isConfigured()) {
            Log::info("[Mock Telegram] sendPhoto to {$chatId}: {$photoUrl}");
            return ['ok' => true, 'mock' => true];
        }

        // Check if $photoUrl points to a local file on disk
        $localFilePath = null;
        if (file_exists($photoUrl) && is_file($photoUrl)) {
            $localFilePath = $photoUrl;
        } else {
            $parsedPath = parse_url($photoUrl, PHP_URL_PATH);
            if ($parsedPath) {
                $cleaned = ltrim(preg_replace('#^/api/v1/storage#', '', $parsedPath), '/');
                $cleaned = ltrim(preg_replace('#^/storage#', '', $cleaned), '/');

                $candidates = [
                    public_path($cleaned),
                    storage_path('app/public/' . $cleaned),
                    base_path('../apps/adminkhposcommerce/public/' . $cleaned),
                ];
                foreach ($candidates as $cand) {
                    if (file_exists($cand) && is_file($cand)) {
                        $localFilePath = $cand;
                        break;
                    }
                }
            }
        }

        try {
            $payload = [
                'chat_id'    => (string)$chatId,
                'caption'    => $caption,
                'parse_mode' => 'HTML',
            ];
            if ($replyMarkup) {
                $payload['reply_markup'] = json_encode($replyMarkup);
            }

            if ($localFilePath && file_exists($localFilePath)) {
                $req = Http::timeout(15)->asMultipart();
                foreach ($payload as $k => $v) {
                    $req->attach($k, $v);
                }
                $response = $req->attach('photo', file_get_contents($localFilePath), basename($localFilePath))
                    ->post("{$this->baseUrl}/sendPhoto");
            } else {
                $payload['photo'] = $photoUrl;
                $response = Http::timeout(10)->post("{$this->baseUrl}/sendPhoto", $payload);
            }

            $resData = $response->json() ?? ['ok' => false];
            if (!($resData['ok'] ?? false) && !empty($caption)) {
                Log::warning("Telegram sendPhoto failed, falling back to sendMessage: " . ($resData['description'] ?? ''));
                return $this->sendMessage($chatId, $caption, $replyMarkup);
            }

            return $resData;
        } catch (\Throwable $e) {
            Log::error("Telegram sendPhoto error: " . $e->getMessage());
            return $this->sendMessage($chatId, $caption, $replyMarkup);
        }
    }

    /**
     * Answer callback query (for inline button clicks).
     */
    public function answerCallbackQuery(string $callbackQueryId, string $text = '', bool $showAlert = false): array
    {
        if (!$this->isConfigured()) {
            return ['ok' => true];
        }

        try {
            $response = Http::timeout(5)->post("{$this->baseUrl}/answerCallbackQuery", [
                'callback_query_id' => $callbackQueryId,
                'text'              => $text,
                'show_alert'        => $showAlert,
            ]);
            return $response->json() ?? ['ok' => false];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Register webhook URL with Telegram.
     */
    public function setWebhook(string $url, ?string $secretToken = null): array
    {
        if (!$this->isConfigured()) {
            return ['ok' => false, 'message' => 'TELEGRAM_BOT_TOKEN is not configured'];
        }

        $payload = ['url' => $url];
        if ($secretToken) {
            $payload['secret_token'] = $secretToken;
        }

        $response = Http::timeout(10)->post("{$this->baseUrl}/setWebhook", $payload);
        return $response->json() ?? ['ok' => false];
    }

    /**
     * Delete webhook.
     */
    public function deleteWebhook(): array
    {
        if (!$this->isConfigured()) {
            return ['ok' => false, 'message' => 'TELEGRAM_BOT_TOKEN is not configured'];
        }

        $response = Http::timeout(10)->post("{$this->baseUrl}/deleteWebhook");
        return $response->json() ?? ['ok' => false];
    }

    /**
     * Get current webhook info.
     */
    public function getWebhookInfo(): array
    {
        if (!$this->isConfigured()) {
            return ['ok' => false, 'message' => 'TELEGRAM_BOT_TOKEN is not configured'];
        }

        $response = Http::timeout(10)->get("{$this->baseUrl}/getWebhookInfo");
        return $response->json() ?? ['ok' => false];
    }
}
