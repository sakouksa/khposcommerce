<?php

namespace App\Models\Purchase;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Warehouse;
use App\Models\Supplier\Supplier;
use App\Models\User;

use App\Traits\SoftDeletesEnterprise;

class Purchase extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise;

    protected $fillable = [
        'company_id', 'branch_id', 'warehouse_id', 'supplier_id', 'user_id',
        'reference_number', 'date', 'due_date', 'status',
        'payment_status', 'subtotal', 'tax_amount', 'discount_amount',
        'shipping_cost', 'grand_total', 'paid_amount', 'due_amount',
        'subtotal_base', 'tax_amount_base', 'discount_amount_base',
        'shipping_cost_base', 'grand_total_base', 'paid_amount_base', 'due_amount_base',
        'currency_code', 'exchange_rate', 'notes',
    ];

    protected $casts = [
        'date'                 => 'date',
        'due_date'             => 'date',
        'subtotal'             => 'decimal:2',
        'tax_amount'           => 'decimal:2',
        'discount_amount'      => 'decimal:2',
        'shipping_cost'        => 'decimal:2',
        'grand_total'          => 'decimal:2',
        'paid_amount'          => 'decimal:2',
        'due_amount'           => 'decimal:2',
        'subtotal_base'        => 'decimal:2',
        'tax_amount_base'      => 'decimal:2',
        'discount_amount_base' => 'decimal:2',
        'shipping_cost_base'   => 'decimal:2',
        'grand_total_base'     => 'decimal:2',
        'paid_amount_base'     => 'decimal:2',
        'due_amount_base'      => 'decimal:2',
        'exchange_rate'        => 'decimal:6',
    ];

    public function company(): BelongsTo   { return $this->belongsTo(Company::class); }
    public function branch(): BelongsTo    { return $this->belongsTo(Branch::class); }
    public function warehouse(): BelongsTo { return $this->belongsTo(Warehouse::class); }
    public function supplier(): BelongsTo  { return $this->belongsTo(Supplier::class); }
    public function creator(): BelongsTo   { return $this->belongsTo(User::class, 'user_id'); }
    public function items(): HasMany       { return $this->hasMany(PurchaseItem::class); }
    public function returns(): HasMany     { return $this->hasMany(PurchaseReturn::class); }

    public function scopePending($query)  { return $query->where('status', 'pending'); }
    public function scopeOrdered($query)  { return $query->where('status', 'ordered'); }
    public function scopeReceived($query) { return $query->where('status', 'received'); }

    /**
     * Derive payment_status string from financial values.
     * Call this whenever paid_amount or grand_total changes.
     */
    public static function derivePaymentStatus(float $paidAmount, float $grandTotal): string
    {
        if ($paidAmount <= 0) {
            return 'unpaid';
        }
        if ($paidAmount >= $grandTotal) {
            return 'paid';
        }
        return 'partial';
    }
}
