<?php

namespace App\Traits;

use App\Models\Company\Company;
use App\Services\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToCompany
{
    /**
     * Automatically populate company_id upon model creation if not explicitly set.
     */
    public static function bootBelongsToCompany(): void
    {
        static::creating(function ($model) {
            if (empty($model->company_id)) {
                $model->company_id = TenantContext::companyId();
            }
        });
    }

    /**
     * Relationship to Company.
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

        $userCompanyId = auth()->user()?->company_id;
        if ($userCompanyId) {
            return $query->where($this->qualifyColumn('company_id'), $userCompanyId);
        }

        return $query;
    }
}
