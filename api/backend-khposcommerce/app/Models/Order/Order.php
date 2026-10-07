<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Company\Company;
use App\Models\Company\Store;
use App\Models\Company\Warehouse;
use App\Models\Customer\Customer;
use App\Format\Traits\NormalizesAttributes;
use App\Models\Shipping\ShippingMethod;
use Illuminate\Support\Facades\Auth;

class Order extends Model
{
    use HasFactory, SoftDeletes, NormalizesAttributes;

    protected $fillable = [
        'company_id', 'store_id', 'customer_id', 'warehouse_id',
        'order_number', 'status', 'payment_status', 'fulfillment_status',
        'shipping_name', 'shipping_phone', 'shipping_address', 'shipping_city',
        'shipping_province', 'shipping_country', 'shipping_postal_code',
        'shipping_method_id', 'shipping_cost', 'subtotal', 'tax_amount',
        'discount_amount', 'grand_total', 'paid_amount', 'coupon_code',
        'currency_code', 'exchange_rate', 'customer_notes', 'admin_notes',
    ];

    protected $casts = [
        'shipping_cost'   => 'decimal:2',
        'subtotal'        => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'grand_total'     => 'decimal:2',
        'paid_amount'     => 'decimal:2',
        'exchange_rate'   => 'decimal:6',
    ];

    public function company(): BelongsTo        { return $this->belongsTo(Company::class); }
    public function store(): BelongsTo          { return $this->belongsTo(Store::class); }
    public function customer(): BelongsTo       { return $this->belongsTo(Customer::class); }
    public function warehouse(): BelongsTo      { return $this->belongsTo(Warehouse::class); }
    public function shippingMethod(): BelongsTo { return $this->belongsTo(ShippingMethod::class); }
    public function items(): HasMany            { return $this->hasMany(OrderItem::class); }
    public function statusHistories(): HasMany  { return $this->hasMany(OrderStatusHistory::class)->latest(); }
    public function shipment(): HasOne          { return $this->hasOne(Shipment::class)->latest(); }
    public function payments(): HasMany         { return $this->hasMany(\App\Models\Payment\Payment::class, 'payable_id')
                                                              ->where('payable_type', self::class); }
    public function returns(): HasMany          { return $this->hasMany(OrderReturn::class)->latest(); }

    public function scopePending($query)    { return $query->where('status', 'pending'); }
    public function scopeCompleted($query)  { return $query->where('status', 'completed'); }
    public function scopeForCustomer($query, int $customerId) { return $query->where('customer_id', $customerId); }

    public function addStatusHistory(string $status, ?string $comment = null, bool $notify = false): void
    {
        $this->statusHistories()->create([
            'user_id'          => Auth::id(),
            'status'           => $status,
            'comment'          => $comment,
            'notify_customer'  => $notify,
        ]);
        $this->update(['status' => $status]);
    }
}
