<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product\Product;

class PromotionBuyXGetY extends Model
{
    protected $table = 'promotion_buy_x_get_y';

    protected $fillable = [
        'promotion_rule_id',
        'buy_quantity',
        'get_quantity',
        'buy_product_id',
        'get_product_id',
        'discount_type',
        'discount_value',
    ];

    protected $casts = [
        'buy_quantity'   => 'decimal:4',
        'get_quantity'   => 'decimal:4',
        'discount_value' => 'decimal:2',
    ];

    public function rule(): BelongsTo
    {
        return $this->belongsTo(PromotionRule::class, 'promotion_rule_id');
    }

    public function buyProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'buy_product_id');
    }

    public function getProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'get_product_id');
    }
}
