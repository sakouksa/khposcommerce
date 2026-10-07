<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Format\Traits\NormalizesAttributes;

class Plan extends Model
{
    use HasFactory, SoftDeletes, NormalizesAttributes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_yearly',
        'currency',
        'max_branches',
        'max_users',
        'max_warehouses',
        'max_products',
        'max_orders_per_month',
        'max_storage_mb',
        'features',
        'is_popular',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_monthly'        => 'float',
        'price_yearly'         => 'float',
        'max_branches'         => 'integer',
        'max_users'            => 'integer',
        'max_warehouses'       => 'integer',
        'max_products'         => 'integer',
        'max_orders_per_month' => 'integer',
        'max_storage_mb'       => 'integer',
        'features'             => 'array',
        'is_popular'           => 'boolean',
        'is_active'            => 'boolean',
        'sort_order'           => 'integer',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function hasFeature(string $featureKey): bool
    {
        if (empty($this->features)) {
            return false;
        }
        return !empty($this->features[$featureKey]);
    }
}
