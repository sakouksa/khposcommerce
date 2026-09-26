<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Warehouse;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;
use App\Models\User;

class InventoryMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'warehouse_id', 'product_id', 'product_variant_id', 'user_id',
        'reference_type', 'reference_id', 'type', 'quantity', 'quantity_before',
        'quantity_after', 'unit_cost', 'notes',
    ];

    protected $casts = [
        'quantity'        => 'decimal:4',
        'quantity_before' => 'decimal:4',
        'quantity_after'  => 'decimal:4',
        'unit_cost'       => 'decimal:2',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
