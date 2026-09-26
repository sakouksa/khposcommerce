<?php

namespace App\Models\Media;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'file_name', 'file_path', 'file_type',
        'file_size', 'mime_type', 'mediable_id', 'mediable_type',
    ];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }
}
