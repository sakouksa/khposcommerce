<?php

namespace App\Models\Payment;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Company;

class PaymentMethod extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'name', 'code', 'type', 'logo',
        'config', 'fee_percent', 'fee_fixed', 'is_active',
        'available_pos', 'available_online',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'available_pos'    => 'boolean',
        'available_online' => 'boolean',
        'config'           => 'array',
        'fee_percent'      => 'decimal:4',
        'fee_fixed'        => 'decimal:2',
    ];

    public function company(): BelongsTo 
    { 
        return $this->belongsTo(Company::class); 
    }
    
    public function scopeActive($query)  
    { 
        return $query->where('is_active', true); 
    }
}
