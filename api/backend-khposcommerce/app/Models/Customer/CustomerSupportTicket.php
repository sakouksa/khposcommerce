<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerSupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'ticket_number',
        'subject',
        'type',
        'priority',
        'status',
        'description',
        'resolution',
        'assigned_to',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
