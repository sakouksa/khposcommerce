<?php

namespace App\Scopes;

use App\Services\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Enterprise Multi-Tenant Global Scope
 *
 * Guarantees that every Eloquent query executed on a tenant-owned model
 * is strictly isolated to the current tenant (company_id).
 *
 * Prevents cross-tenant data leakage, IDOR vulnerabilities, and cross-company spoofing.
 */
class TenantScope implements Scope
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

        // 3. Super Admin platform-wide access ONLY when no specific tenant context is active
        if ($user && $user->hasRole('super_admin') && TenantContext::getActiveCompanyId() === null) {
            return;
        }

        // 4. Enforce canonical company_id boundary
        $tenantId = TenantContext::companyId();
        if ($tenantId) {
            $builder->where($model->qualifyColumn('company_id'), $tenantId);
        }
    }
}
