<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Customer\Customer;
use App\Models\Product\Product;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'customer_id', 'product_id'];

    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function product(): BelongsTo  { return $this->belongsTo(Product::class); }
}
