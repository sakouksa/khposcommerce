<?php

namespace App\Traits;

use App\Models\Company\Branch;
use App\Scopes\BranchScope;
use App\Services\Support\TenantContext;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Enterprise BelongsToBranch Trait
 *
 * Applies the BranchScope global scope to automatically restrict queries
 * to the authenticated user's authorized branch(es), and auto-stamps
 * the active branch_id upon creation.
 */
trait BelongsToBranch
{
    use BelongsToCompany;

    protected static function bootBelongsToBranch(): void
    {
        static::addGlobalScope(new BranchScope());

        static::creating(function ($model) {
            if (empty($model->branch_id)) {
                $activeBranchId = TenantContext::getActiveBranchId();
                if ($activeBranchId) {
                    $model->branch_id = $activeBranchId;
                } elseif (auth()->check() && auth()->user()->branch_id) {
                    $model->branch_id = auth()->user()->branch_id;
                }
            }
        });
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
