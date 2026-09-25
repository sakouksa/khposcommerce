<?php

namespace App\Models\POS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\Company\Store;
use App\Models\User;

class CashRegister extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'branch_id', 'store_id', 'user_id',
        'name', 'code', 'title', 'status', 'opened_at', 'closed_at',
        'opening_balance', 'closing_balance', 'expected_balance',
        'total_sales', 'total_refunds', 'total_expenses',
        'total_cash_in', 'total_cash_out', 'notes',
    ];

    protected $casts = [
        'opened_at'        => 'datetime',
        'closed_at'        => 'datetime',
        'opening_balance'  => 'decimal:2',
        'closing_balance'  => 'decimal:2',
        'expected_balance' => 'decimal:2',
        'total_sales'      => 'decimal:2',
        'total_refunds'    => 'decimal:2',
        'total_expenses'   => 'decimal:2',
        'total_cash_in'    => 'decimal:2',
        'total_cash_out'   => 'decimal:2',
    ];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function branch(): BelongsTo  { return $this->belongsTo(Branch::class); }
    public function store(): BelongsTo   { return $this->belongsTo(Store::class); }
    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function transactions(): HasMany { return $this->hasMany(CashRegisterTransaction::class); }
}
