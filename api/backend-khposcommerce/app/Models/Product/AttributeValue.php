<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttributeValue extends Model
{
    use HasFactory;
    protected $fillable = ['attribute_id', 'value', 'color_code', 'sort_order'];
    public function attribute() { return $this->belongsTo(Attribute::class); }
}
