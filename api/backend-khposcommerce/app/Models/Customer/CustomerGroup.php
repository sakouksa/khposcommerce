<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerGroup extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['company_id', 'name', 'description', 'discount_percent', 'is_active'];
    protected $casts    = ['discount_percent' => 'decimal:4', 'is_active' => 'boolean'];
    public function customers() { return $this->hasMany(Customer::class); }
}
