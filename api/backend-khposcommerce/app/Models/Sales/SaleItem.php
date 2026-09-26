<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id', 'product_id', 'product_variant_id', 'product_name', 'sku',
        'quantity', 'unit_price', 'cost_price', 'discount_percent', 'discount_amount',
        'tax_percent', 'tax_amount', 'subtotal', 'total',
    ];

    protected $casts = [
        'quantity'         => 'decimal:4',
        'unit_price'       => 'decimal:2',
        'cost_price'       => 'decimal:2',
        'discount_percent' => 'decimal:4',
        'discount_amount'  => 'decimal:2',
        'tax_percent'      => 'decimal:4',
        'tax_amount'       => 'decimal:2',
        'subtotal'         => 'decimal:2',
        'total'            => 'decimal:2',
    ];

    public function sale(): BelongsTo           { return $this->belongsTo(Sale::class); }
    public function product(): BelongsTo        { return $this->belongsTo(Product::class); }
    public function variant(): BelongsTo        { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}
