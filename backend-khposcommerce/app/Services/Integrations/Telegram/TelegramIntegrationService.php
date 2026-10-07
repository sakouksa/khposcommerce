<?php

namespace App\Services\Integrations\Telegram;

use App\Services\Telegram\TelegramService;

class TelegramIntegrationService
{
    public function __construct(protected ?TelegramService $telegramService = null)
    {
    }

    /**
     * Send urgent notification or transaction alert to configured Telegram chat.
     */
    public function sendAlert(string $message, ?string $chatId = null): bool
    {
        if ($this->telegramService) {
            return (bool) $this->telegramService->sendMessage($chatId ?? config('services.telegram.chat_id', ''), $message);
        }

        return true;
    }
}
