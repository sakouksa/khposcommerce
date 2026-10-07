<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerWalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'type',
        'amount',
        'balance_after',
        'reference_no',
        'payment_method',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount'        => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
