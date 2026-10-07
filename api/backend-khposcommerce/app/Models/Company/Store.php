<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Format\Traits\NormalizesAttributes;
use App\Traits\SoftDeletesEnterprise;
use App\Traits\CleansStorageFiles;

class Store extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise, CleansStorageFiles, NormalizesAttributes;

    protected $fillable = [
        'company_id', 'branch_id', 'name', 'slug', 'domain',
        'email', 'phone', 'address', 'logo', 'banner',
        'description', 'type', 'is_active', 'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings'  => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
