<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerInteraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'type',
        'subject',
        'description',
        'outcome',
        'interacted_at',
        'next_follow_up_at',
        'created_by',
    ];

    protected $casts = [
        'interacted_at'      => 'datetime',
        'next_follow_up_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
