<?php

namespace App\Models\Shipping;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingRate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shipping_zone_id', 'shipping_method_id', 'name',
        'rate_type', 'min_value', 'max_value', 'price',
    ];

    protected $casts = [
        'min_value' => 'decimal:4',
        'max_value' => 'decimal:4',
        'price'     => 'decimal:2',
    ];

    public function zone(): BelongsTo           { return $this->belongsTo(ShippingZone::class, 'shipping_zone_id'); }
    public function shippingMethod(): BelongsTo { return $this->belongsTo(ShippingMethod::class); }
}
