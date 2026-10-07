<?php

namespace App\Models\Log;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'user_id', 'event', 'auditable_type',
        'auditable_id', 'old_values', 'new_values', 'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
