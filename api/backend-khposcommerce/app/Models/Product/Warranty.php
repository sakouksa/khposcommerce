<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;
use App\Models\Customer\Customer;
use App\Models\Order\OrderItem;
use App\Models\Sales\SaleItem;

class Warranty extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'order_item_id',
        'sale_item_id',
        'product_id',
        'customer_id',
        'serial_number',
        'warranty_code',
        'duration_months',
        'start_date',
        'end_date',
        'status',
        'terms',
    ];

    protected $casts = [
        'duration_months' => 'integer',
        'start_date'      => 'date',
        'end_date'        => 'date',
    ];

    public function company(): BelongsTo    { return $this->belongsTo(Company::class); }
    public function orderItem(): BelongsTo  { return $this->belongsTo(OrderItem::class); }
    public function saleItem(): BelongsTo   { return $this->belongsTo(SaleItem::class); }
    public function product(): BelongsTo    { return $this->belongsTo(Product::class); }
    public function customer(): BelongsTo   { return $this->belongsTo(Customer::class); }
    public function claims(): HasMany       { return $this->hasMany(WarrantyClaim::class); }
}
