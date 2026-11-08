<?php

namespace App\Traits;

use App\Models\Company\Company;
use App\Scopes\TenantScope;
use App\Services\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToCompany
{
    /**
     * Boot the trait: register TenantScope and auto-stamp company_id on create.
     */
    public static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            $user = auth()->user();
            $tenantId = TenantContext::companyId();

            if ($user) {
                // If user is authenticated and not a super_admin, force stamp from active tenant context
                if (!$user->hasRole('super_admin')) {
                    $model->company_id = $tenantId;
                } elseif (empty($model->company_id)) {
                    $model->company_id = $tenantId;
                }
            } else {
                // In CLI, seeders, or unauthenticated background scripts: only stamp if not explicitly provided
                if (empty($model->company_id)) {
                    $model->company_id = $tenantId;
                }
            }
        });
    }

    /**
     * Relationship to Company (Tenant).
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * Scope query to a specific company ID.
     */
    public function scopeForCompany(Builder $query, ?int $companyId = null): Builder
    {
        if ($companyId) {
            return $query->where($this->qualifyColumn('company_id'), $companyId);
        }

        $tenantId = TenantContext::companyId();
        if ($tenantId) {
            return $query->where($this->qualifyColumn('company_id'), $tenantId);
        }

        return $query;
    }

    /**
     * Convenience method to query without tenant scope for platform admin operations.
     */
    public static function withoutTenantScope(): Builder
    {
        return static::withoutGlobalScope(TenantScope::class);
    }
}
