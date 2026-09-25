<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'product_variant_id', 'price_type', 'min_qty',
        'price', 'currency_code', 'start_date', 'end_date', 'is_active',
    ];

    protected $casts = [
        'price'      => 'decimal:2',
        'start_date' => 'date',
        'end_date'   => 'date',
        'is_active'  => 'boolean',
    ];

    public function product() { return $this->belongsTo(Product::class); }
    public function variant() { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}
