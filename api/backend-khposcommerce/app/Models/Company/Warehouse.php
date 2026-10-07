<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Inventory\Inventory;

use App\Traits\SoftDeletesEnterprise;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise;

    protected $fillable = [
        'company_id', 'branch_id', 'name', 'code',
        'address', 'city', 'province', 'phone',
        'pic_name', 'is_main', 'is_active',
    ];

    protected $casts = [
        'is_main'   => 'boolean',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }
}
