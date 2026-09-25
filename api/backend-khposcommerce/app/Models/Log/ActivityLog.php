<?php

namespace App\Models\Log;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = 'activity_log';

    protected $fillable = ['log_name', 'description', 'subject_type', 'event', 'subject_id', 'causer_type', 'causer_id', 'properties', 'batch_uuid'];

    protected $casts = [
        'properties' => 'array',
    ];


    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function causer(): BelongsTo
    {
        return $this->belongsTo(Causer::class);
    }
}
