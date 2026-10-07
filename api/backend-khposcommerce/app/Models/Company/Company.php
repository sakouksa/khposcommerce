<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

use App\Format\Traits\NormalizesAttributes;
use App\Traits\SoftDeletesEnterprise;
use App\Traits\CleansStorageFiles;

class Company extends Model
{
    use HasFactory, SoftDeletes, LogsActivity, SoftDeletesEnterprise, CleansStorageFiles, NormalizesAttributes;

    protected $fillable = [
        'name', 'slug', 'email', 'phone', 'website',
        'address', 'city', 'province', 'country', 'postal_code',
        'tax_number', 'logo', 'currency_code', 'timezone', 'language',
        'is_active', 'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings'  => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['name', 'is_active'])->useLogName('company');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
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

    public function expenseCategories(): HasMany
    {
        return $this->hasMany(\App\Models\Expense\ExpenseCategory::class);
    }

    public function shippingMethods(): HasMany
    {
        return $this->hasMany(\App\Models\Shipping\ShippingMethod::class);
    }

    public function shippingZones(): HasMany
    {
        return $this->hasMany(\App\Models\Shipping\ShippingZone::class);
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(\App\Models\Marketing\Promotion::class);
    }
}
