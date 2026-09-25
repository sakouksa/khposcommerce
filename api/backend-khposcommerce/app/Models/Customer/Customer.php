<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Format\Traits\NormalizesAttributes;
use App\Models\User;
use App\Traits\SoftDeletesEnterprise;
use App\Traits\CleansStorageFiles;

class Customer extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise, CleansStorageFiles, NormalizesAttributes;

    protected $fillable = [
        'company_id',
        'customer_group_id',
        'user_id',
        'name',
        'email',
        'phone',
        'gender',
        'birth_date',
        'photo',
        'total_spent',
        'order_count',
        'loyalty_points',
        'payment_terms',
        'credit_limit',
        'outstanding_balance',
        'is_credit_hold',
        'wallet_balance',
        'tax_number',
        'tax_branch_code',
        'rfm_segment',
        'churn_risk_score',
        'tags',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'birth_date'          => 'date',
        'total_spent'         => 'decimal:2',
        'loyalty_points'      => 'decimal:2',
        'credit_limit'        => 'decimal:2',
        'outstanding_balance' => 'decimal:2',
        'wallet_balance'      => 'decimal:2',
        'churn_risk_score'    => 'decimal:2',
        'is_credit_hold'      => 'boolean',
        'is_active'           => 'boolean',
        'tags'                => 'array',
    ];

    protected $appends = [
        'avatar',
    ];

    public function getAvatarAttribute(): ?string
    {
        return $this->photo;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(CustomerGroup::class, 'customer_group_id');
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function defaultAddress(): HasMany
    {
        return $this->addresses()->where('is_default', true);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(\App\Models\Sales\Sale::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(\App\Models\Order\Order::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(\App\Models\Order\OrderReturn::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(CustomerContact::class)->orderBy('is_primary', 'desc');
    }

    public function kycDocuments(): HasMany
    {
        return $this->hasMany(CustomerKycDocument::class)->latest();
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(CustomerWalletTransaction::class)->latest();
    }

    public function pointsLedger(): HasMany
    {
        return $this->hasMany(CustomerPointsLedger::class)->latest();
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(CustomerInteraction::class)->latest('interacted_at');
    }

    public function pricingContracts(): HasMany
    {
        return $this->hasMany(CustomerPricingContract::class)->latest();
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(CustomerSupportTicket::class)->latest();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCreditHold($query)
    {
        return $query->where('is_credit_hold', true);
    }

    public function scopeRfm($query, string $segment)
    {
        return $query->where('rfm_segment', $segment);
    }
}
