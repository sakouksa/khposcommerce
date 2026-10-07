<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Sales\Sale;

class ExchangeOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_return_id',
        'replacement_order_id',
        'replacement_sale_id',
        'old_items_credit',
        'new_items_cost',
        'price_difference',
        'exchange_fee',
        'shipping_difference',
        'customer_balance_due',
        'store_refund_due',
        'payment_status',
        'notes',
    ];

    protected $casts = [
        'old_items_credit'    => 'decimal:2',
        'new_items_cost'      => 'decimal:2',
        'price_difference'    => 'decimal:2',
        'exchange_fee'        => 'decimal:2',
        'shipping_difference' => 'decimal:2',
        'customer_balance_due'=> 'decimal:2',
        'store_refund_due'    => 'decimal:2',
    ];

    public function orderReturn(): BelongsTo       { return $this->belongsTo(OrderReturn::class); }
    public function replacementOrder(): BelongsTo  { return $this->belongsTo(Order::class, 'replacement_order_id'); }
    public function replacementSale(): BelongsTo   { return $this->belongsTo(Sale::class, 'replacement_sale_id'); }
}
