<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Order\Order;
use App\Models\Order\OrderReturn;
use App\Models\User;

class StoreCreditTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_wallet_id',
        'order_return_id',
        'order_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'expires_at',
        'reference_number',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount'         => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after'  => 'decimal:2',
        'expires_at'     => 'datetime',
    ];

    public function wallet(): BelongsTo      { return $this->belongsTo(CustomerWallet::class, 'customer_wallet_id'); }
    public function orderReturn(): BelongsTo { return $this->belongsTo(OrderReturn::class); }
    public function order(): BelongsTo       { return $this->belongsTo(Order::class); }
    public function createdBy(): BelongsTo   { return $this->belongsTo(User::class, 'created_by'); }
}
