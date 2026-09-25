<?php

namespace App\Models\Purchase;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseReturnItem extends Model
{
    use HasFactory;
    protected $fillable = ['purchase_return_id', 'purchase_item_id', 'product_id', 'product_variant_id', 'batch_number', 'serial_number', 'quantity', 'unit_cost', 'total', 'notes', 'unit_cost_base', 'total_base'];
    protected $casts    = ['quantity' => 'decimal:4', 'unit_cost' => 'decimal:2', 'total' => 'decimal:2', 'unit_cost_base' => 'decimal:2', 'total_base' => 'decimal:2'];
    public function purchaseReturn() { return $this->belongsTo(PurchaseReturn::class); }
    public function purchaseItem()   { return $this->belongsTo(PurchaseItem::class); }
    public function variant()        { return $this->belongsTo(\App\Models\Product\ProductVariant::class, 'product_variant_id'); }
    public function product()        { return $this->belongsTo(\App\Models\Product\Product::class, 'product_id'); }
}
