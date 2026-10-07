<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Product\AttributeValue;
use App\Models\Inventory\Inventory;
use App\Format\Traits\NormalizesAttributes;
use App\Traits\CleansStorageFiles;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes, CleansStorageFiles, NormalizesAttributes;

    protected $fillable = [
        'product_id', 'name', 'sku', 'barcode',
        'cost_price', 'selling_price', 'compare_price',
        'weight', 'image', 'is_active',
    ];

    protected $casts = [
        'cost_price'    => 'decimal:2',
        'selling_price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'is_active'     => 'boolean',
    ];

    protected $appends = ['stock'];

    public function getStockAttribute(): float
    {
        if (array_key_exists('stock', $this->attributes) && $this->attributes['stock'] !== null) {
            return (float) $this->attributes['stock'];
        }
        if ($this->relationLoaded('inventories')) {
            return (float) $this->inventories->sum('quantity');
        }
        return 0.0;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variantValues(): HasMany
    {
        return $this->hasMany(ProductVariantValue::class);
    }

    public function values(): HasMany
    {
        return $this->hasMany(ProductVariantValue::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'product_variant_values',
            'product_variant_id',
            'attribute_value_id'
        )->withPivot('attribute_id');
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class, 'product_variant_id');
    }
}
