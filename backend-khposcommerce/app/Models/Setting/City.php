<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class City extends Model
{
    use HasFactory;

    protected $fillable = ['province_id', 'name', 'postal_code'];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }
}
