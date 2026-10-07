<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\SoftDeletes;

class Currency extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'code', 'symbol', 'exchange_rate', 'is_active', 'is_default'];

    protected $casts = [
        'exchange_rate' => 'decimal:6',
        'is_active'     => 'boolean',
        'is_default'    => 'boolean',
    ];
}
