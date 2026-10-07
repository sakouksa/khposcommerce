<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company\Company;
use App\Models\Company\Branch;

class Shift extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'name',
        'start_time',
        'end_time',
        'break_minutes',
        'late_grace_minutes',
        'max_check_in_time',
        'min_check_out_time',
        'max_overtime_minutes',
        'working_days',
        'is_active',
    ];

    protected $casts = [
        'break_minutes'        => 'integer',
        'late_grace_minutes'   => 'integer',
        'max_overtime_minutes' => 'integer',
        'working_days'         => 'array',
        'is_active'            => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
