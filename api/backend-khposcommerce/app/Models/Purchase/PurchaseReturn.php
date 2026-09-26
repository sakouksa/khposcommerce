<?php

namespace App\Models\Purchase;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\Supplier\Supplier;

class PurchaseReturn extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'company_id', 'purchase_id', 'supplier_id', 'user_id',
        'reference_number', 'rma_number', 'date', 'total_amount', 'reason', 'status',
        'shipping_carrier', 'tracking_number', 'refund_status', 'refund_method',
        'refund_amount', 'refund_date', 'attachment_url', 'settlement_notes',
        'currency_code', 'exchange_rate', 'total_amount_base',
    ];
    protected $casts = [
        'date'              => 'date',
        'refund_date'       => 'date',
        'total_amount'      => 'decimal:2',
        'refund_amount'     => 'decimal:2',
        'exchange_rate'     => 'decimal:6',
        'total_amount_base' => 'decimal:2',
    ];
    public function purchase(): BelongsTo  { return $this->belongsTo(Purchase::class); }
    public function supplier(): BelongsTo  { return $this->belongsTo(Supplier::class); }
    public function user(): BelongsTo     { return $this->belongsTo(User::class); }
    public function items(): HasMany      { return $this->hasMany(PurchaseReturnItem::class); }
}
