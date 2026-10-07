<?php

namespace App\Services\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Centralized Enterprise Multi-Branch & Data Isolation Scope Service
 *
 * Guarantees that query scoping, record filtering, and mutation authorization
 * strictly adhere to the authenticated user's authorized company, branch, and warehouse boundaries.
 */
class AccessScopeService
{
    /**
     * Resolve the current authenticated user context.
     */
    public static function resolveUser(?User $user = null): ?User
    {
        return $user ?: Auth::user();
    }

    /**
     * Scope an Eloquent query to the user's accessible company.
     */
    public static function scopeCompany(Builder $query, ?User $user = null, string $column = 'company_id'): Builder
    {
        $resolvedUser = self::resolveUser($user);
        if (!$resolvedUser) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where($query->qualifyColumn($column), (int) ($resolvedUser->company_id ?? 1));
    }

    /**
     * Scope an Eloquent query to the user's authorized branches.
     *
     * If a specific branch_id filter is requested by the client:
     * - If user is authorized for that branch: narrow query to that branch.
     * - If user is NOT authorized: force empty result (1 = 0) to prevent leakage.
     * If no branch_id filter is specified:
     * - Scope to all branches authorized for the user.
     */
    public static function scopeBranches(
        Builder $query,
        ?User $user = null,
        ?int $requestedBranchId = null,
        string $branchColumn = 'branch_id'
    ): Builder {
        $resolvedUser = self::resolveUser($user);
        if (!$resolvedUser) {
            return $query->whereRaw('1 = 0');
        }

        $accessibleBranches = $resolvedUser->accessibleBranchIds();
        if (empty($accessibleBranches)) {
            return $query->whereRaw('1 = 0');
        }

        $qualifiedColumn = $query->qualifyColumn($branchColumn);

        if ($requestedBranchId !== null && $requestedBranchId > 0) {
            if (in_array((int) $requestedBranchId, $accessibleBranches, true)) {
                return $query->where($qualifiedColumn, (int) $requestedBranchId);
            }
            // Client requested an unauthorized branch: block data access completely
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn($qualifiedColumn, $accessibleBranches);
    }

    /**
     * Scope an Eloquent query to the user's authorized warehouses.
     */
    public static function scopeWarehouses(
        Builder $query,
        ?User $user = null,
        ?int $requestedWarehouseId = null,
        string $warehouseColumn = 'warehouse_id'
    ): Builder {
        $resolvedUser = self::resolveUser($user);
        if (!$resolvedUser) {
            return $query->whereRaw('1 = 0');
        }

        $accessibleWarehouses = $resolvedUser->accessibleWarehouseIds();
        if (empty($accessibleWarehouses)) {
            return $query->whereRaw('1 = 0');
        }

        $qualifiedColumn = $query->qualifyColumn($warehouseColumn);

        if ($requestedWarehouseId !== null && $requestedWarehouseId > 0) {
            if (in_array((int) $requestedWarehouseId, $accessibleWarehouses, true)) {
                return $query->where($qualifiedColumn, (int) $requestedWarehouseId);
            }
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn($qualifiedColumn, $accessibleWarehouses);
    }

    /**
     * Assert and validate that user has authorization for a specific branch.
     * Throws 403 AccessDeniedHttpException if unauthorized.
     */
    public static function validateBranchAccess(?User $user, int|string|null $branchId, string $action = 'operate in this branch'): int
    {
        $resolvedUser = self::resolveUser($user);
        if (!$resolvedUser) {
            throw new AccessDeniedHttpException('Unauthenticated.');
        }

        if ($branchId === null || $branchId === '' || !$resolvedUser->canAccessBranch((int) $branchId)) {
            throw new AccessDeniedHttpException("You are not authorized to {$action} (Branch ID: {$branchId}).");
        }

        return (int) $branchId;
    }

    /**
     * Assert and validate that user has authorization for a specific warehouse.
     * Throws 403 AccessDeniedHttpException if unauthorized.
     */
    public static function validateWarehouseAccess(?User $user, int|string|null $warehouseId, string $action = 'operate in this warehouse'): int
    {
        $resolvedUser = self::resolveUser($user);
        if (!$resolvedUser) {
            throw new AccessDeniedHttpException('Unauthenticated.');
        }

        if ($warehouseId === null || $warehouseId === '' || !$resolvedUser->canAccessWarehouse((int) $warehouseId)) {
            throw new AccessDeniedHttpException("You are not authorized to {$action} (Warehouse ID: {$warehouseId}).");
        }

        return (int) $warehouseId;
    }

    /**
     * Determine active branch ID safely from request context.
     */
    public static function resolveActiveBranch(Request $request, ?User $user = null): ?int
    {
        $resolvedUser = self::resolveUser($user) ?? $request->user();
        if (!$resolvedUser) {
            return null;
        }

        return $resolvedUser->getActiveBranchId($request);
    }
}
