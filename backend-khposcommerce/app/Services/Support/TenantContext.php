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
    protected static ?int $activeCompanyId = null;
    protected static ?int $activeBranchId = null;
    protected static ?int $activeWarehouseId = null;
    protected static bool $bypassed = false;

    /**
     * Check if tenant scoping is temporarily bypassed.
     */
    public static function isBypassed(): bool
    {
        return static::$bypassed;
    }

    /**
     * Check if an explicit tenant scope has been configured.
     */
    public static function hasExplicitContext(): bool
    {
        return static::$activeCompanyId !== null;
    }

    /**
     * Run a callback bypassing tenant scoping (e.g. platform cron, data migrations).
     */
    public static function bypass(callable $callback): mixed
    {
        $previous = static::$bypassed;
        static::$bypassed = true;
        try {
            return $callback();
        } finally {
            static::$bypassed = $previous;
        }
    }

    /**
     * Execute a callback under a specific tenant context and restore previous context afterwards.
     */
    public static function withTenant(int $companyId, callable $callback, ?int $branchId = null, ?int $warehouseId = null): mixed
    {
        $prevCompany = static::$activeCompanyId;
        $prevBranch = static::$activeBranchId;
        $prevWarehouse = static::$activeWarehouseId;

        static::$activeCompanyId = $companyId;
        static::$activeBranchId = $branchId;
        static::$activeWarehouseId = $warehouseId;

        try {
            return $callback();
        } finally {
            static::$activeCompanyId = $prevCompany;
            static::$activeBranchId = $prevBranch;
            static::$activeWarehouseId = $prevWarehouse;
        }
    }

    /**
     * Bind active request scope (set by EnforceTenantScope middleware).
     */
    public static function setContext(?int $companyId, ?int $branchId, ?int $warehouseId = null): void
    {
        static::$activeCompanyId = $companyId;
        static::$activeBranchId = $branchId;
        static::$activeWarehouseId = $warehouseId;
    }

    /**
     * Reset active scope (useful between tests or daemon workers).
     */
    public static function reset(): void
    {
        static::$activeCompanyId = null;
        static::$activeBranchId = null;
        static::$activeWarehouseId = null;
        static::$bypassed = false;
    }

    /**
     * Get explicitly bound active company ID.
     */
    public static function getActiveCompanyId(): ?int
    {
        return static::$activeCompanyId;
    }

    /**
     * Get explicitly bound active branch ID.
     */
    public static function getActiveBranchId(): ?int
    {
        return static::$activeBranchId;
    }

    /**
     * Get explicitly bound active warehouse ID.
     */
    public static function getActiveWarehouseId(): ?int
    {
        return static::$activeWarehouseId;
    }

    /**
     * Get current authenticated company ID.
     */
    public static function companyId(?Request $request = null, int $default = 1): int
    {
        if (static::$activeCompanyId !== null) {
            return static::$activeCompanyId;
        }

        $req = $request ?? (function_exists('request') ? request() : null);
        $user = $req?->user() ?? Auth::user();
        if ($user && $user->company_id) {
            return (int) $user->company_id;
        }

        if ($req) {
            $headerCompany = $req->header('X-Company-Id') ?? $req->input('company_id');
            if ($headerCompany && is_numeric($headerCompany)) {
                return (int) $headerCompany;
            }
        }

        return $default;
    }

    /**
     * Get active branch ID for the current request.
     */
    public static function branchId(?Request $request = null): ?int
    {
        if (static::$activeBranchId !== null) {
            return static::$activeBranchId;
        }

        $user = $request?->user() ?? Auth::user();
        if (!$user) {
            return null;
        }

        return $user->getActiveBranchId($request);
    }

    /**
     * Get active query scope branch IDs for current request.
     * When a specific branch is selected, returns only that active branch.
     * When company-wide scope is active (e.g. Owner/Super Admin with no branch filter), returns all accessible branches.
     *
     * @return array<int>
     */
    public static function branchIds(?Request $request = null): array
    {
        if (static::$activeBranchId !== null) {
            return [static::$activeBranchId];
        }

        $user = $request?->user() ?? Auth::user();
        if (!$user) {
            return [];
        }

        return $user->accessibleBranchIds();
    }

    /**
     * Get all accessible branch IDs for current user across their company.
     *
     * @return array<int>
     */
    public static function allAccessibleBranchIds(?Request $request = null): array
    {
        $user = $request?->user() ?? Auth::user();
        if (!$user) {
            return [];
        }

        return $user->accessibleBranchIds();
    }

    /**
     * Get active warehouse ID for the current request.
     */
    public static function warehouseId(?Request $request = null): ?int
    {
        if (static::$activeWarehouseId !== null) {
            return static::$activeWarehouseId;
        }

        $user = $request?->user() ?? Auth::user();
        if (!$user) {
            return null;
        }

        $accessible = static::warehouseIds($request);
        return !empty($accessible) ? $accessible[0] : null;
    }

    /**
     * Get warehouse IDs scoped to current active branch(es).
     *
     * @return array<int>
     */
    public static function warehouseIds(?Request $request = null): array
    {
        $branchIds = static::branchIds($request);
        if (empty($branchIds)) {
            return [];
        }

        $companyId = static::companyId($request);

        return \App\Models\Company\Warehouse::where('company_id', $companyId)
            ->whereIn('branch_id', $branchIds)
            ->where('is_active', true)
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->toArray();
    }

    /**
     * Get all accessible warehouse IDs for current user.
     *
     * @return array<int>
     */
    public static function allAccessibleWarehouseIds(?Request $request = null): array
    {
        $user = $request?->user() ?? Auth::user();
        if (!$user) {
            return [];
        }

        return $user->accessibleWarehouseIds();
    }
}
