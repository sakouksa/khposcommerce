<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Company;
use App\Models\Product\Category;

class ReturnPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'category_id',
        'name',
        'return_window_days',
        'is_returnable',
        'allow_exchange',
        'restocking_fee_percentage',
        'restocking_fee_flat',
        'customer_fault_shipping_fee',
        'store_fault_shipping_fee',
        'requires_original_packaging',
        'requires_receipt',
        'conditions_accepted',
        'is_default',
    ];

    protected $casts = [
        'return_window_days'          => 'integer',
        'is_returnable'               => 'boolean',
        'allow_exchange'              => 'boolean',
        'restocking_fee_percentage'   => 'decimal:2',
        'restocking_fee_flat'         => 'decimal:2',
        'customer_fault_shipping_fee' => 'decimal:2',
        'store_fault_shipping_fee'    => 'decimal:2',
        'requires_original_packaging' => 'boolean',
        'requires_receipt'            => 'boolean',
        'conditions_accepted'         => 'array',
        'is_default'                  => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
