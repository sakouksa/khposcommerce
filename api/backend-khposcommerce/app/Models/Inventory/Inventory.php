<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Warehouse;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'warehouse_id', 'product_id', 'product_variant_id',
        'quantity', 'reserved_quantity', 'reorder_point', 'reorder_qty',
    ];

    protected $casts = [
        'quantity'          => 'decimal:4',
        'reserved_quantity' => 'decimal:4',
        'reorder_point'     => 'decimal:4',
        'reorder_qty'       => 'decimal:4',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity <= reorder_point');
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->reorder_point;
    }
}
