<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Company\Company;
use App\Models\Company\Warehouse;
use App\Models\Customer\Customer;
use App\Models\Sales\Sale;
use App\Models\User;

class OrderReturn extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'order_id',
        'sale_id',
        'customer_id',
        'warehouse_id',
        'return_number',
        'type',
        'channel',
        'fault',
        'reason_code',
        'reason_notes',
        'status',
        'currency_code',
        'exchange_rate',
        'subtotal_amount',
        'allocated_discount_amount',
        'tax_amount',
        'restocking_fee',
        'return_shipping_fee',
        'total_refund_amount',
        'refund_status',
        'refund_method',
        'refund_account_info',
        'expires_at',
        'approved_by',
        'approved_at',
        'completed_at',
        'admin_notes',
    ];

    protected $casts = [
        'exchange_rate'             => 'decimal:6',
        'subtotal_amount'           => 'decimal:2',
        'allocated_discount_amount' => 'decimal:2',
        'tax_amount'                => 'decimal:2',
        'restocking_fee'            => 'decimal:2',
        'return_shipping_fee'       => 'decimal:2',
        'total_refund_amount'       => 'decimal:2',
        'refund_account_info'       => 'array',
        'expires_at'                => 'datetime',
        'approved_at'               => 'datetime',
        'completed_at'              => 'datetime',
    ];

    public function company(): BelongsTo     { return $this->belongsTo(Company::class); }
    public function order(): BelongsTo       { return $this->belongsTo(Order::class); }
    public function sale(): BelongsTo        { return $this->belongsTo(Sale::class); }
    public function customer(): BelongsTo    { return $this->belongsTo(Customer::class); }
    public function warehouse(): BelongsTo   { return $this->belongsTo(Warehouse::class); }
    public function approvedBy(): BelongsTo  { return $this->belongsTo(User::class, 'approved_by'); }

    public function items(): HasMany         { return $this->hasMany(OrderReturnItem::class); }
    public function shipments(): HasMany     { return $this->hasMany(ReturnShipment::class); }
    public function latestShipment(): HasOne { return $this->hasOne(ReturnShipment::class)->latestOfMany(); }
    public function inspections(): HasMany   { return $this->hasMany(ReturnInspection::class); }
    public function latestInspection(): HasOne { return $this->hasOne(ReturnInspection::class)->latestOfMany(); }
    public function exchangeOrder(): HasOne  { return $this->hasOne(ExchangeOrder::class); }
}
