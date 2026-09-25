<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;

/*
|--------------------------------------------------------------------------
| Enterprise API Routes Master Loader
|--------------------------------------------------------------------------
|
| This file coordinates and registers all versioned and consumer-specific
| API route modules. Business logic is shared across the Domain & Application
| layers, while API presentation layers are cleanly isolated:
|
|   • routes/api/v1/auth.php     -> Authentication & Profile security
|   • routes/api/v1/admin.php    -> Admin Dashboard & ERP back-office
|   • routes/api/v1/customer.php -> Customer E-Commerce Storefront
|   • routes/api/v1/mobile.php   -> Flutter Mobile App specific endpoints
|   • routes/api/v1/public.php   -> Public unauthenticated branding/media
|
*/

// ─── Global Health Check ───────────────────────────────────────────────────
Route::get('health', [HealthController::class, 'check']);

// ─── API Version 1 (V1) ─────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Public / System Infrastructure Endpoints
    require __DIR__ . '/api/v1/public.php';

    // Shared Authentication & Security Endpoints
    require __DIR__ . '/api/v1/auth.php';

    // ─── Consumer Namespace: Customer E-Commerce Storefront ────────────────
    // Standard consumer route: /api/v1/customer/*
    Route::prefix('customer')->group(function () {
        require __DIR__ . '/api/v1/customer.php';
    });

    // Backward-compatibility alias for Customer Website: /api/v1/store/*
    Route::prefix('store')->group(function () {
        require __DIR__ . '/api/v1/customer.php';
    });

    // ─── Consumer Namespace: Flutter Mobile App ────────────────────────────
    // Standard consumer route: /api/v1/mobile/*
    Route::prefix('mobile')->group(function () {
        require __DIR__ . '/api/v1/mobile.php';
    });

    // ─── Consumer Namespace: Admin Dashboard & ERP Back-Office ─────────────
    // Standard consumer route: /api/v1/admin/*
    Route::prefix('admin')->group(function () {
        require __DIR__ . '/api/v1/admin.php';
    });

    // ─── Telegram Bot Webhook & Integration Endpoints ─────────────────────
    Route::post('telegram/webhook',        [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'handleWebhook']);
    Route::post('telegram/setup-webhook',  [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'setupWebhook']);
    Route::get('telegram/webhook-info',    [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'webhookInfo']);
    Route::post('telegram/broadcast',       [\App\Http\Controllers\Api\V1\Admin\CMS\BlogController::class, 'broadcastToTelegram']);

    // Backward-compatibility direct root routes for Admin Dashboard & Mobile App
    require __DIR__ . '/api/v1/admin.php';
});

// Root compatibility alias
Route::post('chat/message',      [\App\Http\Controllers\Api\V1\Customer\ChatbotController::class, 'sendMessage']);
Route::post('telegram/webhook',  [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'handleWebhook']);

