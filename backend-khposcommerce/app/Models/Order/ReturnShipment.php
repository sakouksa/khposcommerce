<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Shipping\ShippingMethod;

class ReturnShipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_return_id',
        'shipping_method_id',
        'carrier',
        'tracking_number',
        'pickup_type',
        'shipping_fee',
        'paid_by',
        'status',
        'shipped_at',
        'delivered_at',
        'notes',
    ];

    protected $casts = [
        'shipping_fee' => 'decimal:2',
        'shipped_at'   => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function orderReturn(): BelongsTo    { return $this->belongsTo(OrderReturn::class); }
    public function shippingMethod(): BelongsTo { return $this->belongsTo(ShippingMethod::class); }
}
