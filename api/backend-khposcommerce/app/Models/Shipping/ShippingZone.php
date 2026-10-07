<?php

namespace App\Models\Shipping;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;

use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingZone extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['company_id', 'name', 'countries', 'provinces', 'cities'];

    protected $casts = [
        'countries' => 'array',
        'provinces' => 'array',
        'cities'    => 'array',
    ];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function rates(): HasMany     { return $this->hasMany(ShippingRate::class); }
}
