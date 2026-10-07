<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromotionBundle extends Model
{
    protected $table = 'promotion_bundles';

    protected $fillable = [
        'promotion_rule_id',
        'name',
        'fixed_price',
    ];

    protected $casts = [
        'fixed_price' => 'decimal:2',
    ];

    public function rule(): BelongsTo
    {
        return $this->belongsTo(PromotionRule::class, 'promotion_rule_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PromotionBundleItem::class, 'promotion_bundle_id');
    }
}
