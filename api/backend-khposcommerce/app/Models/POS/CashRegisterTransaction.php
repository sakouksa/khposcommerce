<?php

namespace App\Models\POS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashRegisterTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_register_id', 'type', 'amount', 'notes',
        'reference_type', 'reference_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function cashRegister(): BelongsTo { return $this->belongsTo(CashRegister::class); }
}
