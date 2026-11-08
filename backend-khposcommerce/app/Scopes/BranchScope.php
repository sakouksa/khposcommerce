<?php

namespace App\Scopes;

use App\Services\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Enterprise Multi-Branch Global Scope
 *
 * Guarantees that every Eloquent query executed on a branch-isolated model
 * is strictly isolated to the user's authorized branch(es).
 *
 * Prevents cross-branch data leakage, IDOR vulnerabilities, and unauthorized branch access.
 */
class BranchScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // 1. Explicit system bypass check (e.g. platform maintenance, batch jobs)
        if (TenantContext::isBypassed()) {
            return;
        }

        // 2. Command line / migration / seeder check: only skip if unauthenticated and no explicit tenant context
        if (app()->runningInConsole() && !TenantContext::hasExplicitContext() && !auth()->check()) {
            return;
        }

        $user = auth()->user();

        // 3. Super Admin platform-wide access ONLY when no specific branch context is active
        if ($user && $user->hasRole('super_admin') && TenantContext::getActiveBranchId() === null) {
            return;
        }

        // 4. Company Owner access to all branches inside company ONLY when no specific branch context is active
        if ($user && $user->hasRole('owner') && TenantContext::getActiveBranchId() === null) {
            return;
        }

        // 5. If active branch is pinned (via header or request)
        $activeBranchId = TenantContext::getActiveBranchId();
        if ($activeBranchId) {
            $builder->where($model->qualifyColumn('branch_id'), $activeBranchId);
            return;
        }

        // 6. Non-owner / non-super_admin: scope strictly to accessible branches
        if ($user) {
            $accessibleBranches = $user->accessibleBranchIds();
            if (!empty($accessibleBranches)) {
                $builder->whereIn($model->qualifyColumn('branch_id'), $accessibleBranches);
            } else {
                $builder->whereRaw('1 = 0');
            }
        }
    }
}
