<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Traits\SoftDeletesEnterprise;

class Branch extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise;

    protected $fillable = [
        'company_id', 'name', 'code', 'email', 'phone',
        'address', 'city', 'province', 'postal_code',
        'is_main', 'is_active',
    ];

    protected $casts = [
        'is_main'   => 'boolean',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function stores(): HasMany
    {
        return $this->hasMany(Store::class);
    }

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }

    public function departments(): HasMany
    {
        return $this->hasMany(\App\Models\Employee\Department::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(\App\Models\Employee\Employee::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(\App\Models\Expense\Expense::class);
    }
}
