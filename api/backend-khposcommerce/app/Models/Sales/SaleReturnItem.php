<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleReturnItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_return_id', 'sale_item_id', 'product_id', 'product_variant_id',
        'quantity', 'unit_price', 'total', 'notes',
    ];

    protected $casts = [
        'quantity'   => 'decimal:4',
        'unit_price' => 'decimal:2',
        'total'      => 'decimal:2',
    ];

    public function saleReturn() { return $this->belongsTo(SaleReturn::class); }
    public function saleItem()   { return $this->belongsTo(SaleItem::class); }
}
