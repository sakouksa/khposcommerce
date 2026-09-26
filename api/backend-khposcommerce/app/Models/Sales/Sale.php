<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use App\Models\Company\Warehouse;
use App\Models\Customer\Customer;
use App\Models\User;
use App\Models\Payment\PaymentMethod;

use App\Traits\SoftDeletesEnterprise;

class Sale extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise;

    protected $fillable = [
        'company_id', 'branch_id', 'store_id', 'warehouse_id',
        'customer_id', 'user_id', 'invoice_number', 'date',
        'status', 'subtotal', 'tax_amount', 'discount_amount',
        'grand_total', 'paid_amount', 'change_amount',
        'currency_code', 'payment_method_id', 'payment_method', 'payment_details', 'notes',
    ];

    protected $casts = [
        'date'            => 'datetime:Y-m-d H:i:s',
        'subtotal'        => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'grand_total'     => 'decimal:2',
        'paid_amount'     => 'decimal:2',
        'change_amount'   => 'decimal:2',
        'payment_details' => 'array',
    ];

    public function company(): BelongsTo      { return $this->belongsTo(Company::class); }
    public function branch(): BelongsTo       { return $this->belongsTo(Branch::class); }
    public function store(): BelongsTo        { return $this->belongsTo(Store::class); }
    public function warehouse(): BelongsTo    { return $this->belongsTo(Warehouse::class); }
    public function customer(): BelongsTo     { return $this->belongsTo(Customer::class); }
    public function cashier(): BelongsTo      { return $this->belongsTo(User::class, 'user_id'); }
    public function paymentMethod(): BelongsTo{ return $this->belongsTo(PaymentMethod::class); }
    public function items(): HasMany          { return $this->hasMany(SaleItem::class); }
    public function returns(): HasMany        { return $this->hasMany(SaleReturn::class); }
    public function orderReturns(): HasMany   { return $this->hasMany(\App\Models\Order\OrderReturn::class); }

    public function scopeCompleted($query) { return $query->where('status', 'completed'); }
    public function scopeForDate($query, string $date) { return $query->whereDate('date', $date); }
    public function scopeForDateRange($query, string $from, string $to) {
        return $query->whereBetween('date', [$from, $to]);
    }
}
