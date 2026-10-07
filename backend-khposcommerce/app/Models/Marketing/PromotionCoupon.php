<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromotionCoupon extends Model
{
    protected $table = 'promotion_coupons';

    protected $fillable = [
        'promotion_campaign_id',
        'code',
        'usage_limit',
        'usage_per_customer',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'usage_limit'        => 'integer',
        'usage_per_customer' => 'integer',
        'used_count'         => 'integer',
        'starts_at'          => 'datetime',
        'expires_at'         => 'datetime',
        'is_active'          => 'boolean',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(PromotionCampaign::class, 'promotion_campaign_id');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(PromotionUsage::class, 'promotion_coupon_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            });
    }

    public function isValidForCustomer(?int $customerId): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }
        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        if ($customerId && $this->usage_per_customer !== null) {
            $customerUsage = $this->usages()->where('customer_id', $customerId)->count();
            if ($customerUsage >= $this->usage_per_customer) {
                return false;
            }
        }

        return true;
    }
}
