<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Admin\POS\POSController;
use App\Http\Controllers\Api\V1\Admin\POS\CashRegisterController;
use App\Http\Controllers\Api\V1\Admin\Payment\BakongController;

/*
|--------------------------------------------------------------------------
| POS & Cash Register Routes
|--------------------------------------------------------------------------
*/

Route::middleware('permission:pos.access|sale.create|sale.view')->group(function () {
    Route::post('sales',                   [POSController::class, 'sale'])->middleware('permission:sale.create');
    Route::get('sales',                    [POSController::class, 'index'])->middleware('permission:sale.view');
    Route::get('sales/{id}',               [POSController::class, 'show'])->middleware('permission:sale.view');
    Route::post('sales/{id}/return',       [POSController::class, 'processReturn'])->middleware('permission:sale.return|sale.refund');
    Route::get('product-search',           [POSController::class, 'productSearch'])->middleware('permission:product.view');
    Route::get('products/barcode/{code}',  [POSController::class, 'barcodeLookup'])->middleware('permission:product.view');
    Route::post('voice-search',            [POSController::class, 'voiceSearch'])->middleware('permission:product.view');
    Route::post('vision-search',           [POSController::class, 'visionSearch'])->middleware('permission:product.view');
    Route::post('apply-coupon',            [POSController::class, 'applyCoupon'])->middleware('permission:coupon.view');
    Route::post('khqr/generate',           [BakongController::class, 'generate'])->middleware('permission:sale.create|payment.process');
    Route::post('khqr/check',              [BakongController::class, 'check'])->middleware('permission:sale.create|payment.process');
    Route::get('khqr/config',              [BakongController::class, 'config']);
    Route::get('cash-registers',           [CashRegisterController::class, 'index'])->middleware('permission:cash_register.view');
    Route::get('cash-registers/{id}',      [CashRegisterController::class, 'show'])->middleware('permission:cash_register.view');
    Route::post('cash-registers',          [CashRegisterController::class, 'store'])->middleware('permission:cash_register.create|cash_register.manage');
    Route::match(['put', 'patch'], 'cash-registers/{id}', [CashRegisterController::class, 'update'])->middleware('permission:cash_register.update|cash_register.manage');
    Route::delete('cash-registers/{id}',   [CashRegisterController::class, 'destroy'])->middleware('permission:cash_register.delete');
    Route::post('cash-registers/{id}/open',  [CashRegisterController::class, 'open'])->middleware('permission:cash_register.manage');
    Route::post('cash-registers/{id}/close', [CashRegisterController::class, 'close'])->middleware('permission:cash_register.manage');
});
