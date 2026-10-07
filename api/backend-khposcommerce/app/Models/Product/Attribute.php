<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\SoftDeletes;

class Attribute extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['company_id', 'name', 'type', 'is_active'];
    protected $casts    = ['is_active' => 'boolean'];
    public function values(): HasMany { return $this->hasMany(AttributeValue::class); }
}
