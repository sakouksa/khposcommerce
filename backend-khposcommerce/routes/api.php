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
|   • routes/api/v1/auth.php       -> Authentication & Profile security
|   • routes/api/v1/control.php    -> SaaS Platform / Master Multi-tenant control
|   • routes/api/v1/merchant.php   -> Merchant Back-Office ERP & Web POS
|   • routes/api/v1/storefront.php -> Customer E-Commerce Storefront
|   • routes/api/v1/mobile.php     -> Flutter Mobile POS & Staff App
|   • routes/api/v1/public.php     -> Public unauthenticated branding/media
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

    // ─── Consumer Namespace: Storefront E-Commerce Website ────────────────
    // Primary route for storefront-khposcommerce: /api/v1/storefront/*
    Route::prefix('storefront')->group(function () {
        require __DIR__ . '/api/v1/storefront.php';
    });

    // Backward-compatibility aliases for Storefront: /api/v1/customer/* and /api/v1/store/*
    Route::prefix('customer')->group(function () {
        require __DIR__ . '/api/v1/storefront.php';
    });
    Route::prefix('store')->group(function () {
        require __DIR__ . '/api/v1/storefront.php';
    });

    // ─── Consumer Namespace: Flutter Mobile App ────────────────────────────
    // Primary route for app-khposcommerce: /api/v1/mobile/*
    Route::prefix('mobile')->group(function () {
        require __DIR__ . '/api/v1/mobile.php';
    });

    // ─── Consumer Namespace: Merchant Back-Office & Web POS Terminal ───────
    // Primary route for merchant-khposcommerce: /api/v1/merchant/*
    Route::prefix('merchant')->group(function () {
        require __DIR__ . '/api/v1/merchant.php';
    });

    // Backward-compatibility alias for Merchant: /api/v1/admin/*
    Route::prefix('admin')->group(function () {
        require __DIR__ . '/api/v1/merchant.php';
    });

    // ─── Consumer Namespace: Control (Platform SaaS Management) ───────────
    // Primary route for control-khposcommerce: /api/v1/control/*
    Route::prefix('control')->group(function () {
        require __DIR__ . '/api/v1/control.php';
    });

    // Backward-compatibility alias for Control: /api/v1/platform/*
    Route::prefix('platform')->group(function () {
        require __DIR__ . '/api/v1/control.php';
    });

    // ─── Telegram Bot Webhook & Integration Endpoints ─────────────────────
    Route::post('telegram/webhook',        [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'handleWebhook']);
    Route::post('telegram/setup-webhook',  [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'setupWebhook']);
    Route::get('telegram/webhook-info',    [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'webhookInfo']);
    Route::post('telegram/broadcast',       [\App\Http\Controllers\Api\V1\Admin\CMS\BlogController::class, 'broadcastToTelegram']);

    // Backward-compatibility direct root routes for Merchant ERP & POS
    require __DIR__ . '/api/v1/merchant.php';
});

// Root compatibility alias
Route::post('chat/message',      [\App\Http\Controllers\Api\V1\Customer\ChatbotController::class, 'sendMessage']);
Route::post('telegram/webhook',  [\App\Http\Controllers\Api\V1\TelegramWebhookController::class, 'handleWebhook']);

