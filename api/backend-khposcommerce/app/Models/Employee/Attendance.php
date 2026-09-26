<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\User;

class Attendance extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'attendance';

    protected $fillable = [
        'company_id',
        'branch_id',
        'employee_id',
        'department_id',
        'position_id',
        'attendance_date',
        'date',
        'shift_id',
        'check_in',
        'check_out',
        'scheduled_check_in',
        'scheduled_check_out',
        'late_minutes',
        'early_leave_minutes',
        'worked_minutes',
        'break_minutes',
        'overtime_minutes',
        'status',
        'attendance_type',
        'device_id',
        'device_name',
        'device_platform',
        'device_ip',
        'gps_latitude',
        'gps_longitude',
        'qr_token',
        'qr_expired_at',
        'check_in_method',
        'check_out_method',
        'is_manual',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'attendance_date'      => 'date',
        'date'                 => 'date',
        'scheduled_check_in'   => 'datetime',
        'scheduled_check_out'  => 'datetime',
        'late_minutes'         => 'integer',
        'early_leave_minutes'  => 'integer',
        'worked_minutes'       => 'integer',
        'break_minutes'        => 'integer',
        'overtime_minutes'     => 'integer',
        'gps_latitude'         => 'decimal:8',
        'gps_longitude'        => 'decimal:8',
        'qr_expired_at'        => 'datetime',
        'approved_at'          => 'datetime',
        'is_manual'            => 'boolean',
    ];

    protected $appends = [
        'worked_hours_formatted',
        'late_time_formatted',
        'overtime_formatted',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ─── VIRTUAL ACCESSORS ──────────────────────────────────────────────────
    public function getWorkedHoursFormattedAttribute(): string
    {
        $mins = $this->worked_minutes ?? 0;
        if ($mins <= 0) return '0h 0m';
        $h = floor($mins / 60);
        $m = $mins % 60;
        return "{$h}h {$m}m";
    }

    public function getLateTimeFormattedAttribute(): string
    {
        $mins = $this->late_minutes ?? 0;
        if ($mins <= 0) return '0m';
        if ($mins < 60) return "{$mins}m";
        $h = floor($mins / 60);
        $m = $mins % 60;
        return "{$h}h {$m}m";
    }

    public function getOvertimeFormattedAttribute(): string
    {
        $mins = $this->overtime_minutes ?? 0;
        if ($mins <= 0) return '0m';
        if ($mins < 60) return "{$mins}m";
        $h = floor($mins / 60);
        $m = $mins % 60;
        return "{$h}h {$m}m";
    }
}
