<?php

namespace App\Models\Payment;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'payment_id', 'type', 'amount', 'description', 'reference_type', 'reference_id'];

    protected $casts = [
        'amount' => 'decimal:2'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Company\Company::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Payment\Payment::class);
    }

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class);
    }
}
