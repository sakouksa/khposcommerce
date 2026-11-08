<?php

use Illuminate\Support\Facades\Route;

// Dedicated Mobile Controllers
use App\Http\Controllers\Api\V1\Mobile\MobileAuthController;
use App\Http\Controllers\Api\V1\Mobile\MobileDashboardController;
use App\Http\Controllers\Api\V1\Mobile\MobilePOSController;
use App\Http\Controllers\Api\V1\Mobile\MobileProductController;
use App\Http\Controllers\Api\V1\Mobile\MobileOrderController;
use App\Http\Controllers\Api\V1\Mobile\MobileSyncController;

// Supporting Controllers
use App\Http\Controllers\Api\V1\Admin\POS\CashRegisterController;
use App\Http\Controllers\Api\V1\Admin\Inventory\InventoryController;
use App\Http\Controllers\Api\V1\Admin\Inventory\StockAdjustmentController;
use App\Http\Controllers\Api\V1\Admin\Notification\NotificationController;
use App\Http\Controllers\Api\V1\Admin\Company\CompanyController;
use App\Http\Controllers\Api\V1\Admin\Company\BranchController;
use App\Http\Controllers\Api\V1\Admin\Company\StoreController;
use App\Http\Controllers\Api\V1\Admin\Company\WarehouseController;

/*
|--------------------------------------------------------------------------
| Flutter Mobile App Routes (/api/v1/mobile)
|--------------------------------------------------------------------------
| Dedicated, lightweight, branch-isolated endpoints tailored for Flutter POS
| and counter mobile applications.
*/

// ── Mobile Auth ─────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('login',             [MobileAuthController::class, 'login']);
    Route::post('pin-login',         [MobileAuthController::class, 'pinLogin']);
    Route::post('refresh',           [MobileAuthController::class, 'refresh']);

    Route::middleware('auth.jwt')->group(function () {
        Route::post('logout',          [MobileAuthController::class, 'logout']);
        Route::get('profile',          [MobileAuthController::class, 'profile']);
        Route::put('profile',          [MobileAuthController::class, 'updateProfile']);
        Route::post('change-password', [MobileAuthController::class, 'changePassword']);
    });
});

Route::middleware('auth.jwt')->group(function () {
    // ── Mobile Dashboard Summary (Branch Scoped) ────────────────────────────
    Route::prefix('dashboard')->group(function () {
        Route::get('stats',         [MobileDashboardController::class, 'stats']);
        Route::get('sales-chart',   [MobileDashboardController::class, 'salesChart']);
        Route::get('top-products',  [MobileDashboardController::class, 'topProducts']);
        Route::get('recent-orders', [MobileDashboardController::class, 'recentOrders']);
        Route::get('low-stock',     [MobileDashboardController::class, 'lowStock']);
    });

    // ── Mobile POS Operations ───────────────────────────────────────────────
    Route::prefix('pos')->group(function () {
        Route::post('sales',                  [MobilePOSController::class, 'sale']);
        Route::get('sales',                   [MobilePOSController::class, 'index']);
        Route::get('sales/{id}',              [MobilePOSController::class, 'show']);
        Route::post('sales/{id}/return',      [MobilePOSController::class, 'processReturn']);
        Route::get('product-search',          [MobilePOSController::class, 'productSearch']);
        Route::get('products/barcode/{code}', [MobilePOSController::class, 'barcodeLookup']);
        Route::post('voice-search',           [MobilePOSController::class, 'voiceSearch']);
        Route::post('vision-search',          [MobilePOSController::class, 'visionSearch']);
        Route::post('apply-coupon',           [MobilePOSController::class, 'applyCoupon']);
        Route::apiResource('cash-registers',  CashRegisterController::class);
    });

    // ── Mobile Touch Catalog & Categories ───────────────────────────────────
    Route::get('products/stats',      [MobileProductController::class, 'stats']);
    Route::get('products',            [MobileProductController::class, 'index']);
    Route::get('products/{id}',       [MobileProductController::class, 'show']);
    Route::get('categories',          [MobileProductController::class, 'categories']);
    Route::get('brands',              [MobileProductController::class, 'brands']);

    // ── Branch Orders & Customer Counter Lookups ────────────────────────────
    Route::get('orders',              [MobileOrderController::class, 'index']);
    Route::get('orders/{id}',         [MobileOrderController::class, 'show']);
    Route::put('orders/{id}/status',  [MobileOrderController::class, 'updateStatus']);
    Route::get('customers',           [MobileOrderController::class, 'customers']);

    // ── Offline Database Delta-Sync (Flutter SQLite/Isar) ───────────────────
    Route::prefix('sync')->group(function () {
        Route::get('catalog',         [MobileSyncController::class, 'catalog']);
        Route::post('offline-sales',  [MobileSyncController::class, 'pushOfflineSales']);
    });

    // ── Inventory Adjustments & Stock Levels ─────────────────────────────────
    Route::apiResource('inventory',         InventoryController::class);
    Route::apiResource('stock-adjustments', StockAdjustmentController::class);

    // ── Notifications ───────────────────────────────────────────────────────
    Route::get('notifications/unread',   [NotificationController::class, 'unread']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::apiResource('notifications',  NotificationController::class);

    // ── Branch & Company Reference Data ─────────────────────────────────────
    Route::apiResource('companies',   CompanyController::class);
    Route::apiResource('branches',    BranchController::class);
    Route::apiResource('stores',      StoreController::class);
    Route::apiResource('warehouses',  WarehouseController::class);
});
