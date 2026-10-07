<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Format\Traits\NormalizesAttributes;
use App\Traits\SoftDeletesEnterprise;
use App\Traits\CleansStorageFiles;

class Employee extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise, CleansStorageFiles, NormalizesAttributes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'department_id',
        'position_id',
        'reporting_to_id',
        'user_id',
        'employee_number',
        'name',
        'email',
        'phone',
        'nik',
        'gender',
        'birth_date',
        'address',
        'photo',
        'join_date',
        'resign_date',
        'contract_type',
        'contract_end_date',
        'status',
        'basic_salary',
        // POS & Security
        'pos_pin',
        'card_uid',
        'sales_commission_rate',
        'is_pos_supervisor',
        'can_override_discount',
        'can_void_sale',
        // E-Commerce & Driver
        'is_driver',
        'driver_license_no',
        'vehicle_plate_no',
        'driver_status',
        'is_fulfillment_picker',
        // Cambodia Banking & NSSF
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'nssf_number',
        'has_nssf',
        'dependents_count',
    ];

    protected $casts = [
        'birth_date'            => 'date',
        'join_date'             => 'date',
        'resign_date'           => 'date',
        'contract_end_date'     => 'date',
        'basic_salary'          => 'decimal:2',
        'sales_commission_rate' => 'decimal:2',
        'is_pos_supervisor'     => 'boolean',
        'can_override_discount' => 'boolean',
        'can_void_sale'         => 'boolean',
        'is_driver'             => 'boolean',
        'is_fulfillment_picker' => 'boolean',
        'has_nssf'              => 'boolean',
        'dependents_count'      => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Company\Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Company\Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Employee\Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Employee\Position::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Employee\Employee::class, 'reporting_to_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(\App\Models\Employee\Employee::class, 'reporting_to_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(\App\Models\Employee\Attendance::class);
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(\App\Models\Employee\Attendance::class);
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(\App\Models\Employee\Payroll::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(\App\Models\Employee\LeaveRequest::class);
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(\App\Models\Employee\LeaveBalance::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(\App\Models\Sales\Sale::class, 'user_id', 'user_id');
    }
}
