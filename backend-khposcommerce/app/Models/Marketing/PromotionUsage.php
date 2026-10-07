<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Customer\Customer;
use App\Models\Sales\Sale;
use App\Models\Order\Order;
use App\Models\Company\Branch;

class PromotionUsage extends Model
{
    protected $table = 'promotion_usages';

    protected $fillable = [
        'promotion_campaign_id',
        'promotion_coupon_id',
        'customer_id',
        'sale_id',
        'order_id',
        'branch_id',
        'discount_amount',
        'used_at',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'used_at'         => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(PromotionCampaign::class, 'promotion_campaign_id');
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(PromotionCoupon::class, 'promotion_coupon_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
