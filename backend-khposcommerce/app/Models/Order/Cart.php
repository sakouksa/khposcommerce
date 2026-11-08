<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Store;
use App\Models\Customer\Customer;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'store_id', 'customer_id', 'session_id'];

    public function store(): BelongsTo       { return $this->belongsTo(Store::class); }
    public function customer(): BelongsTo    { return $this->belongsTo(Customer::class); }
    public function items(): HasMany         { return $this->hasMany(CartItem::class); }
}
