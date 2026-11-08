<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Format\Traits\NormalizesAttributes;

class SubscriptionInvoice extends Model
{
    use HasFactory, SoftDeletes, NormalizesAttributes;

    protected $fillable = [
        'company_id',
        'subscription_id',
        'invoice_number',
        'amount',
        'currency',
        'status',
        'billing_cycle',
        'payment_method',
        'transaction_id',
        'paid_at',
        'due_date',
        'notes',
    ];

    protected $casts = [
        'amount'   => 'float',
        'paid_at'  => 'datetime',
        'due_date' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
