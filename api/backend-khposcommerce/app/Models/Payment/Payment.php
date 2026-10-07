<?php

namespace App\Models\Payment;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'payment_method_id', 'payable_id', 'payable_type',
        'transaction_id', 'reference', 'amount', 'fee', 'currency_code',
        'status', 'paid_at', 'gateway_response', 'notes',
    ];

    protected $casts = [
        'amount'            => 'decimal:2',
        'fee'               => 'decimal:2',
        'paid_at'           => 'datetime',
        'gateway_response'  => 'array',
    ];

    public function paymentMethod(): BelongsTo { return $this->belongsTo(PaymentMethod::class); }
    public function payable(): MorphTo         { return $this->morphTo(); }

    public function scopeSuccessful($query) { return $query->where('status', 'success'); }
    public function scopePending($query)    { return $query->where('status', 'pending'); }
}
