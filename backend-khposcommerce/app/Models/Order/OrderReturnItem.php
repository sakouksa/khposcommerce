<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;
use App\Models\Sales\SaleItem;

class OrderReturnItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_return_id',
        'order_item_id',
        'sale_item_id',
        'product_id',
        'product_variant_id',
        'quantity_requested',
        'quantity_received',
        'unit_price',
        'allocated_discount',
        'allocated_tax',
        'net_unit_refund',
        'total_refund',
        'sold_serial_number',
        'returned_serial_number',
        'condition_grade',
        'inspection_status',
        'notes',
    ];

    protected $casts = [
        'quantity_requested' => 'decimal:4',
        'quantity_received'  => 'decimal:4',
        'unit_price'         => 'decimal:2',
        'allocated_discount' => 'decimal:2',
        'allocated_tax'      => 'decimal:2',
        'net_unit_refund'    => 'decimal:2',
        'total_refund'       => 'decimal:2',
    ];

    public function orderReturn(): BelongsTo    { return $this->belongsTo(OrderReturn::class); }
    public function orderItem(): BelongsTo      { return $this->belongsTo(OrderItem::class); }
    public function saleItem(): BelongsTo       { return $this->belongsTo(SaleItem::class); }
    public function product(): BelongsTo        { return $this->belongsTo(Product::class); }
    public function variant(): BelongsTo        { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}
