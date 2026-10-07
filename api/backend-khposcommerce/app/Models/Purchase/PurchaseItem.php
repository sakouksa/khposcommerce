<?php

namespace App\Models\Purchase;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;

class PurchaseItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'purchase_id', 'product_id', 'product_variant_id',
        'quantity', 'quantity_received', 'unit_cost', 'tax_percent', 'tax_amount',
        'discount_percent', 'discount_amount', 'subtotal', 'total', 'notes',
        'currency_code', 'exchange_rate', 'unit_cost_base', 'subtotal_base', 'total_base',
    ];
    protected $casts = [
        'quantity'          => 'decimal:4',
        'quantity_received' => 'decimal:4',
        'unit_cost'         => 'decimal:2',
        'tax_percent'       => 'decimal:4',
        'tax_amount'        => 'decimal:2',
        'discount_percent'  => 'decimal:4',
        'discount_amount'   => 'decimal:2',
        'subtotal'          => 'decimal:2',
        'total'             => 'decimal:2',
        'exchange_rate'     => 'decimal:6',
        'unit_cost_base'    => 'decimal:2',
        'subtotal_base'     => 'decimal:2',
        'total_base'        => 'decimal:2',
    ];
    public function purchase(): BelongsTo { return $this->belongsTo(Purchase::class); }
    public function product(): BelongsTo  { return $this->belongsTo(Product::class)->withTrashed(); }
    public function variant(): BelongsTo  { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
    
    public function returnItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PurchaseReturnItem::class, 'purchase_item_id');
    }

    public function getAlreadyReturnedAttribute(): float
    {
        return (float) $this->returnItems()
            ->whereHas('purchaseReturn', function ($query) {
                $query->where('status', 'approved');
            })
            ->sum('quantity');
    }
}
