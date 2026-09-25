<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class SaleReturn extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'sale_id', 'user_id', 'reference_number',
        'date', 'total_amount', 'refund_amount', 'refund_method',
        'reason', 'status',
    ];

    protected $casts = [
        'date'         => 'datetime',
        'total_amount' => 'decimal:2',
        'refund_amount'=> 'decimal:2',
    ];

    public function sale(): BelongsTo   { return $this->belongsTo(Sale::class); }
    public function user(): BelongsTo   { return $this->belongsTo(User::class); }
    public function items(): HasMany    { return $this->hasMany(SaleReturnItem::class); }
}
