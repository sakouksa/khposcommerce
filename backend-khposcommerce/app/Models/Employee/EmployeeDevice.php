<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'device_id',
        'device_name',
        'device_platform',
        'device_ip',
        'is_locked',
        'last_used_at',
    ];

    protected $casts = [
        'is_locked'    => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
