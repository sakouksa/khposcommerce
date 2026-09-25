<?php

namespace App\Models\Supplier;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Format\Traits\NormalizesAttributes;
use App\Models\Company\Company;

use App\Traits\SoftDeletesEnterprise;
use App\Traits\CleansStorageFiles;

class Supplier extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise, CleansStorageFiles, NormalizesAttributes;

    protected $fillable = [
        'company_id', 'name', 'code', 'logo', 'email', 'phone', 'fax', 'website',
        'hotline', 'support_email', 'tax_number', 'supplier_type', 'tier',
        'address', 'city', 'province', 'country', 'postal_code',
        'payment_terms', 'payment_term_days', 'credit_limit', 'lead_time_days', 'currency_code',
        'bank_name', 'bank_account_name', 'bank_account_number', 'swift_code',
        'notes', 'is_active',
    ];

    protected $casts = [
        'credit_limit'      => 'decimal:2',
        'payment_term_days' => 'integer',
        'lead_time_days'    => 'integer',
        'is_active'         => 'boolean',
    ];

    public function company(): BelongsTo   { return $this->belongsTo(Company::class); }
    public function contacts(): HasMany    { return $this->hasMany(SupplierContact::class); }
    public function purchases(): HasMany   { return $this->hasMany(\App\Models\Purchase\Purchase::class); }
    public function purchaseReturns(): HasMany { return $this->hasMany(\App\Models\Purchase\PurchaseReturn::class); }

    public function scopeActive($query) { return $query->where('is_active', true); }
}
