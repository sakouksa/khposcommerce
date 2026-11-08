<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Format\Traits\NormalizesAttributes;
use Carbon\Carbon;

class Subscription extends Model
{
    use HasFactory, SoftDeletes, NormalizesAttributes;

    protected $fillable = [
        'company_id',
        'plan_id',
        'status',
        'billing_cycle',
        'amount',
        'currency',
        'starts_at',
        'ends_at',
        'trial_ends_at',
        'cancelled_at',
        'paused_at',
        'auto_renew',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'amount'        => 'float',
        'auto_renew'    => 'boolean',
        'starts_at'     => 'datetime',
        'ends_at'       => 'datetime',
        'trial_ends_at' => 'datetime',
        'cancelled_at'  => 'datetime',
        'paused_at'     => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(SubscriptionInvoice::class);
    }

    public function isActive(): bool
    {
        if (in_array($this->status, ['active', 'trialing'], true)) {
            return $this->ends_at ? $this->ends_at->isFuture() : true;
        }
        return false;
    }

    public function isExpired(): bool
    {
        if ($this->status === 'expired') {
            return true;
        }
        return $this->ends_at && $this->ends_at->isPast();
    }

    public function daysRemaining(): int
    {
        if (!$this->ends_at) {
            return 0;
        }
        return (int) Carbon::now()->diffInDays($this->ends_at, false);
    }
}
