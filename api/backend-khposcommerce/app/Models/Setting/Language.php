<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Language extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'is_active', 'is_default', 'direction'];

    protected $casts = [
        'is_active'  => 'boolean',
        'is_default' => 'boolean',
    ];
}
