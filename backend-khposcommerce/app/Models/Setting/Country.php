<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'phone_code', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function provinces(): HasMany
    {
        return $this->hasMany(Province::class);
    }
}
