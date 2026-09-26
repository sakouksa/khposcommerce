<?php

use Illuminate\Support\Facades\Route;

// Auth
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\ProfileController;

// Admin ERP Controllers
use App\Http\Controllers\Api\V1\Admin\Report\DashboardController;
use App\Http\Controllers\Api\V1\Admin\Product\ProductController;
use App\Http\Controllers\Api\V1\Admin\Product\CategoryController;
use App\Http\Controllers\Api\V1\Admin\Product\BrandController;
use App\Http\Controllers\Api\V1\Admin\Inventory\InventoryController;
use App\Http\Controllers\Api\V1\Admin\Inventory\StockAdjustmentController;
use App\Http\Controllers\Api\V1\Admin\POS\POSController;
use App\Http\Controllers\Api\V1\Admin\POS\CashRegisterController;
use App\Http\Controllers\Api\V1\Admin\Sales\SaleController;
use App\Http\Controllers\Api\V1\Admin\Order\OrderController;
use App\Http\Controllers\Api\V1\Admin\Customer\CustomerController;
use App\Http\Controllers\Api\V1\Admin\Notification\NotificationController;
use App\Http\Controllers\Api\V1\Admin\Company\CompanyController;
use App\Http\Controllers\Api\V1\Admin\Company\BranchController;
use App\Http\Controllers\Api\V1\Admin\Company\StoreController;
use App\Http\Controllers\Api\V1\Admin\Company\WarehouseController;

/*
|--------------------------------------------------------------------------
| Flutter Mobile App Routes (/api/v1/mobile)
|--------------------------------------------------------------------------
*/

// Mobile Auth
Route::prefix('auth')->group(function () {
    Route::post('login',             [AuthController::class, 'login']);
    Route::post('refresh',           [AuthController::class, 'refresh']);

    Route::middleware('auth.jwt')->group(function () {
        Route::post('logout',          [AuthController::class, 'logout']);
        Route::get('profile',          [AuthController::class, 'profile']);
        Route::put('profile',          [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });
});

Route::middleware('auth.jwt')->group(function () {
    // Mobile Dashboard Summary
    Route::prefix('dashboard')->group(function () {
        Route::get('stats',         [DashboardController::class, 'stats']);
        Route::get('sales-chart',   [DashboardController::class, 'salesChart']);
        Route::get('top-products',  [DashboardController::class, 'topProducts']);
        Route::get('recent-orders', [DashboardController::class, 'recentOrders']);
        Route::get('low-stock',     [DashboardController::class, 'lowStock']);
    });

    // Mobile POS Operations
    Route::prefix('pos')->group(function () {
        Route::post('sales',                  [POSController::class, 'sale']);
        Route::get('sales',                   [POSController::class, 'index']);
        Route::get('sales/{id}',              [POSController::class, 'show']);
        Route::post('sales/{id}/return',      [POSController::class, 'processReturn']);
        Route::get('product-search',          [POSController::class, 'productSearch']);
        Route::get('products/barcode/{code}', [POSController::class, 'barcodeLookup']);
        Route::post('voice-search',           [POSController::class, 'voiceSearch']);
        Route::post('vision-search',          [POSController::class, 'visionSearch']);
        Route::post('apply-coupon',           [POSController::class, 'applyCoupon']);
        Route::apiResource('cash-registers',  CashRegisterController::class);
    });

    // Catalog & Inventory
    Route::get('products/stats', [ProductController::class, 'stats']);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('inventory', InventoryController::class);
    Route::apiResource('stock-adjustments', StockAdjustmentController::class);

    // Sales & Orders
    Route::apiResource('sales', SaleController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('customers', CustomerController::class);

    // Notifications
    Route::get('notifications/unread', [NotificationController::class, 'unread']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::apiResource('notifications', NotificationController::class);

    // Organization
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('stores', StoreController::class);
    Route::apiResource('warehouses', WarehouseController::class);
});
