<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;

class PromotionRule extends Model
{
    protected $table = 'promotion_rules';

    protected $fillable = [
        'promotion_campaign_id',
        'name',
        'rule_type',
        'discount_type',
        'discount_value',
        'min_qty',
        'max_qty',
        'min_subtotal',
        'max_subtotal',
        'max_discount_amount',
        'priority',
        'is_stackable',
        'is_active',
    ];

    protected $casts = [
        'discount_value'      => 'decimal:2',
        'min_qty'             => 'decimal:4',
        'max_qty'             => 'decimal:4',
        'min_subtotal'        => 'decimal:2',
        'max_subtotal'        => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'priority'            => 'integer',
        'is_stackable'        => 'boolean',
        'is_active'           => 'boolean',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(PromotionCampaign::class, 'promotion_campaign_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'promotion_rule_products', 'promotion_rule_id', 'product_id')->withTimestamps();
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'promotion_rule_categories', 'promotion_rule_id', 'category_id')->withTimestamps();
    }

    public function brands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class, 'promotion_rule_brands', 'promotion_rule_id', 'brand_id')->withTimestamps();
    }

    public function buyXGetY(): HasOne
    {
        return $this->hasOne(PromotionBuyXGetY::class, 'promotion_rule_id');
    }

    public function bundles(): HasMany
    {
        return $this->hasMany(PromotionBundle::class, 'promotion_rule_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
