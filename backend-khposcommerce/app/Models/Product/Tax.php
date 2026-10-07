<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\BelongsToCompany;

class Tax extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;
    protected $fillable = ['company_id', 'name', 'rate', 'type', 'is_active'];
    protected $casts    = ['rate' => 'decimal:4', 'is_active' => 'boolean'];
}
