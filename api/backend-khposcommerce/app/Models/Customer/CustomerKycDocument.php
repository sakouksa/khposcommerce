<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerKycDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'document_type',
        'title',
        'document_number',
        'file_url',
        'file_size',
        'issue_date',
        'expiry_date',
        'status',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'issue_date'  => 'date',
        'expiry_date' => 'date',
        'verified_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
