<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Platform\PlatformDashboardController;

/*
|--------------------------------------------------------------------------
| Control (SaaS Master Platform Management) Routes
| Target Client: control-khposcommerce (Multi-tenant SaaS & Subscription Ops)
| Base Prefixes: /api/v1/control & /api/v1/platform
|--------------------------------------------------------------------------
*/

Route::middleware(['auth.jwt'])->group(function () {
    // Platform Dashboard & Metrics
    Route::get('dashboard/stats',          [PlatformDashboardController::class, 'stats']);
    Route::get('system-health',            [PlatformDashboardController::class, 'systemHealth']);
    Route::get('activity-logs',            [PlatformDashboardController::class, 'activityLogs']);

    // Tenant / Company Management
    Route::get('companies',                [PlatformDashboardController::class, 'companies']);
    Route::post('companies',               [PlatformDashboardController::class, 'storeCompany']);
    Route::get('companies/{id}',           [PlatformDashboardController::class, 'showCompany']);
    Route::put('companies/{id}',           [PlatformDashboardController::class, 'updateCompany']);
    Route::patch('companies/{id}/toggle',  [PlatformDashboardController::class, 'toggleCompanyStatus']);

    // SaaS Plans Management
    Route::get('plans',                    [PlatformDashboardController::class, 'plans']);
    Route::post('plans',                   [PlatformDashboardController::class, 'storePlan']);
    Route::put('plans/{id}',               [PlatformDashboardController::class, 'updatePlan']);

    // Subscriptions
    Route::get('subscriptions',            [PlatformDashboardController::class, 'subscriptions']);
});
