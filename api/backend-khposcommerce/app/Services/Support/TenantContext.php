<?php

namespace App\Services\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Enterprise Multi-Tenant Context Helper
 *
 * Centralizes retrieval of active tenant / company identifier
 * across controllers, services, repositories, and models.
 */
class TenantContext
{
    /**
     * Get current authenticated company ID or default fallback.
     *
     * @param Request|null $request
     * @param int $default
     * @return int
     */
    public static function companyId(?Request $request = null, int $default = 1): int
    {
        if ($request && $request->user()) {
            return (int) ($request->user()->company_id ?? $default);
        }

        return (int) (Auth::user()?->company_id ?? $default);
    }
}
