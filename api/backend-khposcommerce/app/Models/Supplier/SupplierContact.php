<?php

namespace App\Models\Supplier;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SupplierContact extends Model
{
    use HasFactory;
    protected $fillable = ['supplier_id', 'name', 'email', 'phone', 'position', 'is_primary'];
    protected $casts    = ['is_primary' => 'boolean'];
    public function supplier() { return $this->belongsTo(Supplier::class); }
}
