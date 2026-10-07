<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerPointsLedger extends Model
{
    use HasFactory;

    protected $table = 'customer_points_ledger';

    protected $fillable = [
        'customer_id',
        'type',
        'points',
        'balance_after',
        'reference_no',
        'expiry_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'points'        => 'decimal:2',
        'balance_after' => 'decimal:2',
        'expiry_date'   => 'date',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
