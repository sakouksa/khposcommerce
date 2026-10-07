<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Admin\Chatbot\AdminChatbotController;
use App\Http\Controllers\Api\V1\Customer\ChatbotController;

/*
|--------------------------------------------------------------------------
| AI Chatbot & Messaging Routes
|--------------------------------------------------------------------------
*/

// Public/Customer Chatbot
Route::post('message', [ChatbotController::class, 'sendMessage']);

// Admin Chatbot Management
Route::middleware(['auth.jwt', 'permission:chatbot.view|chatbot.manage'])->group(function () {
    Route::get('dashboard',                 [AdminChatbotController::class, 'dashboard']);
    Route::get('sessions',                  [AdminChatbotController::class, 'sessions']);
    Route::get('sessions/{id}',             [AdminChatbotController::class, 'showSession']);
    Route::get('support-requests',          [AdminChatbotController::class, 'supportRequests']);
    Route::put('support-requests/{id}',      [AdminChatbotController::class, 'updateSupportRequest']);
    Route::get('telegram-users',            [AdminChatbotController::class, 'telegramUsers']);
    Route::post('test-notification',        [AdminChatbotController::class, 'testNotification']);
});
