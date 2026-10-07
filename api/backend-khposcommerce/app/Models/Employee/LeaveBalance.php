<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Company;

class LeaveBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'employee_id',
        'year',
        'annual_leave_total',
        'annual_leave_used',
        'sick_leave_total',
        'sick_leave_used',
        'special_leave_total',
        'special_leave_used',
        'maternity_leave_total',
        'maternity_leave_used',
    ];

    protected $casts = [
        'year'                  => 'integer',
        'annual_leave_total'    => 'decimal:1',
        'annual_leave_used'     => 'decimal:1',
        'sick_leave_total'      => 'decimal:1',
        'sick_leave_used'       => 'decimal:1',
        'special_leave_total'   => 'decimal:1',
        'special_leave_used'    => 'decimal:1',
        'maternity_leave_total' => 'decimal:1',
        'maternity_leave_used'  => 'decimal:1',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
