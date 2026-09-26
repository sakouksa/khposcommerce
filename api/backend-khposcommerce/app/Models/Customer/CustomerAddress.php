<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerAddress extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'customer_id', 'label', 'name', 'phone', 'address',
        'city', 'province', 'country', 'postal_code',
        'latitude', 'longitude', 'is_default',
    ];
    protected $casts = ['is_default' => 'boolean', 'latitude' => 'decimal:8', 'longitude' => 'decimal:8'];
    public function customer() { return $this->belongsTo(Customer::class); }
}
