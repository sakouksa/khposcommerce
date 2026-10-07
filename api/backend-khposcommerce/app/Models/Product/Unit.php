<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\SoftDeletes;

class Unit extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['company_id', 'name', 'symbol', 'description', 'is_active'];
    protected $casts    = ['is_active' => 'boolean'];
}
