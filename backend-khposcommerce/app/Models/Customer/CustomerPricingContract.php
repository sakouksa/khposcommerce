<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerPricingContract extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'contract_number',
        'title',
        'start_date',
        'end_date',
        'discount_type',
        'discount_value',
        'status',
        'items',
        'terms_and_conditions',
    ];

    protected $casts = [
        'start_date'     => 'date',
        'end_date'       => 'date',
        'discount_value' => 'decimal:2',
        'items'          => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
