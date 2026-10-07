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
        'primary_owner_id',
        'name', 'slug', 'email', 'phone', 'website',
        'address', 'city', 'province', 'country', 'postal_code',
        'tax_number', 'logo', 'currency_code', 'timezone', 'language',
        'is_active', 'settings',
    ];

    protected $casts = [
        'primary_owner_id' => 'integer',
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

    public function primaryOwner(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'primary_owner_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function subscription(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(SubscriptionInvoice::class);
    }

    public function currentPlan(): ?Plan
    {
        return $this->subscription?->plan;
    }

    public function hasActiveSubscription(): bool
    {
        $sub = $this->subscription;
        return $sub ? $sub->isActive() : false;
    }

    public function canUseFeature(string $featureKey): bool
    {
        $plan = $this->currentPlan();
        if (!$plan) {
            return false;
        }
        return $plan->hasFeature($featureKey);
    }

    public function checkLimit(string $limitKey, int $currentCount): bool
    {
        $plan = $this->currentPlan();
        if (!$plan) {
            return false;
        }

        $limit = match ($limitKey) {
            'branches'   => $plan->max_branches,
            'users'      => $plan->max_users,
            'warehouses' => $plan->max_warehouses,
            'products'   => $plan->max_products,
            'orders'     => $plan->max_orders_per_month,
            default      => -1,
        };

        if ($limit === -1) {
            return true; // Unlimited
        }

        return $currentCount < $limit;
    }
}
