<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;

class StockOpnameItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_opname_id', 'product_id', 'product_variant_id',
        'system_quantity', 'physical_quantity', 'difference', 'notes',
    ];

    protected $casts = [
        'system_quantity'   => 'decimal:4',
        'physical_quantity' => 'decimal:4',
        'difference'        => 'decimal:4',
    ];

    public function stockOpname(): BelongsTo
    {
        return $this->belongsTo(StockOpname::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
