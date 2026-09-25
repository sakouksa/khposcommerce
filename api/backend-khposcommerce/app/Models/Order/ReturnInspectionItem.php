<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnInspectionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'return_inspection_id',
        'order_return_item_id',
        'serial_matched',
        'accessories_checklist',
        'condition_grade',
        'deduction_amount',
        'inventory_action',
        'inspector_notes',
        'photos',
    ];

    protected $casts = [
        'serial_matched'        => 'boolean',
        'accessories_checklist' => 'array',
        'deduction_amount'      => 'decimal:2',
        'photos'                => 'array',
    ];

    public function inspection(): BelongsTo     { return $this->belongsTo(ReturnInspection::class, 'return_inspection_id'); }
    public function orderReturnItem(): BelongsTo { return $this->belongsTo(OrderReturnItem::class, 'order_return_item_id'); }
}
