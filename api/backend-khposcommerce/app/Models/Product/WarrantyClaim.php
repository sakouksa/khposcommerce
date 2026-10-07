<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Customer\Customer;
use App\Models\User;

class WarrantyClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_id',
        'customer_id',
        'claim_number',
        'issue_description',
        'claim_type',
        'status',
        'resolution',
        'repair_cost',
        'repaired_at',
        'resolved_by',
        'notes',
    ];

    protected $casts = [
        'repair_cost' => 'decimal:2',
        'repaired_at' => 'datetime',
    ];

    public function warranty(): BelongsTo   { return $this->belongsTo(Warranty::class); }
    public function customer(): BelongsTo   { return $this->belongsTo(Customer::class); }
    public function resolvedBy(): BelongsTo { return $this->belongsTo(User::class, 'resolved_by'); }
}
