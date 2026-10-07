<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;

class OrderItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'order_id', 'product_id', 'product_variant_id', 'product_name',
        'product_sku', 'product_image', 'quantity', 'unit_price',
        'discount_amount', 'tax_amount', 'subtotal', 'total',
    ];
    protected $casts = [
        'quantity'        => 'decimal:4',
        'unit_price'      => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'subtotal'        => 'decimal:2',
        'total'           => 'decimal:2',
    ];
    public function order(): BelongsTo   { return $this->belongsTo(Order::class); }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
    public function variant(): BelongsTo { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}
