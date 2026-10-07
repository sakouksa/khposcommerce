<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\ProfileController;
use App\Http\Controllers\Api\V1\Auth\DeviceController;
use App\Http\Controllers\Api\V1\Auth\SecurityController;

/*
|--------------------------------------------------------------------------
| Authentication & Identity Routes (/api/v1/auth, /api/v1/profile, etc.)
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('login',             [AuthController::class, 'login']);
    Route::post('register',          [AuthController::class, 'register']);
    Route::post('refresh',           [AuthController::class, 'refresh']);
    Route::post('forgot-password',   [AuthController::class, 'forgotPassword']);
    Route::post('reset-password',    [AuthController::class, 'resetPassword']);

    Route::middleware('auth.jwt')->group(function () {
        Route::post('logout',             [AuthController::class, 'logout']);
        Route::post('logout-all-devices', [AuthController::class, 'logoutAllDevices']);
        Route::get('profile',             [AuthController::class, 'profile']);
        Route::put('profile',             [AuthController::class, 'updateProfile']);
        Route::post('change-password',    [AuthController::class, 'changePassword']);
    });
});

Route::middleware('auth.jwt')->group(function () {
    // ─── Profile Management ──────────────────────────────────────────────────
    Route::prefix('profile')->group(function () {
        Route::get('/',                 [ProfileController::class, 'show']);
        Route::put('/',                 [ProfileController::class, 'update']);
        Route::post('avatar',           [ProfileController::class, 'uploadAvatar']);
        Route::delete('avatar',         [ProfileController::class, 'removeAvatar']);
        Route::post('change-password',  [ProfileController::class, 'changePassword']);
        Route::get('permissions',       [ProfileController::class, 'permissions']);
        Route::get('activity-logs',     [ProfileController::class, 'activityLogs']);
        Route::get('login-history',     [ProfileController::class, 'loginHistory']);
        Route::post('logout-devices',   [ProfileController::class, 'logoutDevices']);
    });

    // ─── Devices & Session Security ──────────────────────────────────────────
    Route::prefix('devices')->group(function () {
        Route::get('/',                 [DeviceController::class, 'index']);
        Route::post('revoke-others',    [DeviceController::class, 'revokeOthers']);
        Route::post('{id}/revoke',      [DeviceController::class, 'revoke']);
        Route::post('{id}/suspicious',  [DeviceController::class, 'markSuspicious']);
    });

    // ─── Security & Manager PIN Overrides ────────────────────────────────────
    Route::prefix('security')->group(function () {
        Route::get('overview',            [SecurityController::class, 'overview']);
        Route::get('settings',            [SecurityController::class, 'settings']);
        Route::put('settings',            [SecurityController::class, 'updateSettings']);
        Route::post('verify-manager-pin', [SecurityController::class, 'verifyManagerPin']);
        Route::post('set-manager-pin',    [SecurityController::class, 'setManagerPin']);
    });
});
