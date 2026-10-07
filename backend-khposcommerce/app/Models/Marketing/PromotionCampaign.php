<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerGroup;
use App\Models\User;
use App\Traits\BelongsToCompany;

class PromotionCampaign extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $table = 'promotion_campaigns';

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'description',
        'status',
        'start_at',
        'end_at',
        'priority',
        'is_stackable',
        'is_active',
        'usage_limit',
        'usage_count',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_at'     => 'datetime',
        'end_at'       => 'datetime',
        'priority'     => 'integer',
        'is_stackable' => 'boolean',
        'is_active'    => 'boolean',
        'usage_limit'  => 'integer',
        'usage_count'  => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function rules(): HasMany
    {
        return $this->hasMany(PromotionRule::class, 'promotion_campaign_id')->orderBy('priority', 'desc');
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class, 'promotion_campaign_branches', 'promotion_campaign_id', 'branch_id')->withTimestamps();
    }

    public function channels(): HasMany
    {
        return $this->hasMany(PromotionCampaignChannel::class, 'promotion_campaign_id');
    }

    public function customerGroups(): BelongsToMany
    {
        return $this->belongsToMany(CustomerGroup::class, 'promotion_customer_groups', 'promotion_campaign_id', 'customer_group_id')->withTimestamps();
    }

    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'promotion_customers', 'promotion_campaign_id', 'customer_id')->withTimestamps();
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(PromotionCoupon::class, 'promotion_campaign_id');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(PromotionUsage::class, 'promotion_campaign_id');
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', now());
            });
    }

    public function scopeForBranch($query, int $branchId)
    {
        return $query->where(function ($q) use ($branchId) {
            // Either campaign is for all branches (no entries in promotion_campaign_branches)
            $q->whereDoesntHave('branches')
              // Or specifically contains this branch
              ->orWhereHas('branches', function ($bQuery) use ($branchId) {
                  $bQuery->where('branches.id', $branchId);
              });
        });
    }

    public function scopeForChannel($query, string $channel)
    {
        return $query->where(function ($q) use ($channel) {
            $q->whereDoesntHave('channels')
              ->orWhereHas('channels', function ($cQuery) use ($channel) {
                  $cQuery->whereIn('channel', [$channel, 'all']);
              });
        });
    }
}
