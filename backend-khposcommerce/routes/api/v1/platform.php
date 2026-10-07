<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Platform\PlatformDashboardController;

Route::middleware(['auth.jwt'])->group(function () {
    Route::get('dashboard/stats', [PlatformDashboardController::class, 'stats']);
    Route::get('companies',       [PlatformDashboardController::class, 'companies']);
    Route::get('plans',           [PlatformDashboardController::class, 'plans']);
});
