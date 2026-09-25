<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Warehouse;
use App\Models\User;

class ReturnInspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_return_id',
        'warehouse_id',
        'inspector_id',
        'inspection_number',
        'status',
        'verdict',
        'summary_notes',
        'images',
        'inspected_at',
    ];

    protected $casts = [
        'images'       => 'array',
        'inspected_at' => 'datetime',
    ];

    public function orderReturn(): BelongsTo { return $this->belongsTo(OrderReturn::class); }
    public function warehouse(): BelongsTo   { return $this->belongsTo(Warehouse::class); }
    public function inspector(): BelongsTo   { return $this->belongsTo(User::class, 'inspector_id'); }
    public function items(): HasMany         { return $this->hasMany(ReturnInspectionItem::class); }
}
