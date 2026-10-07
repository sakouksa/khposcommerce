<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product\Product;

class PromotionBundleItem extends Model
{
    protected $table = 'promotion_bundle_items';

    protected $fillable = [
        'promotion_bundle_id',
        'product_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
    ];

    public function bundle(): BelongsTo
    {
        return $this->belongsTo(PromotionBundle::class, 'promotion_bundle_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
