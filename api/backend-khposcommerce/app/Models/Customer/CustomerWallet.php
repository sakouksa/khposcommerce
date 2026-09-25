<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;

class CustomerWallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'customer_id',
        'balance',
        'currency_code',
        'is_active',
    ];

    protected $casts = [
        'balance'   => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo     { return $this->belongsTo(Company::class); }
    public function customer(): BelongsTo    { return $this->belongsTo(Customer::class); }
    public function transactions(): HasMany  { return $this->hasMany(StoreCreditTransaction::class)->latest(); }
}
