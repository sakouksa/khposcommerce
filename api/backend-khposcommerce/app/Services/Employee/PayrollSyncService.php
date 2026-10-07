<?php

namespace App\Services\Employee;

use App\Models\Employee\Attendance;
use App\Models\Employee\Employee;
use App\Models\Employee\Payroll;
use Carbon\Carbon;

class PayrollSyncService
{
    /**
     * Synchronize and recalculate Payroll for a specific employee and period (e.g. 2026-07).
     */
    public function syncEmployeePayroll(int $employeeId, ?string $periodMonth = null): Payroll
    {
        $periodMonth = $periodMonth ?? Carbon::now()->format('Y-m');
        $employee = Employee::findOrFail($employeeId);

        // Fetch all attendances in this month
        $attendances = Attendance::where('employee_id', $employeeId)
            ->whereYear('attendance_date', substr($periodMonth, 0, 4))
            ->whereMonth('attendance_date', substr($periodMonth, 5, 2))
            ->get();

        $presentDays = 0;
        $lateCount = 0;
        $absentCount = 0;
        $leaveCount = 0;
        $holidayCount = 0;
        $totalWorkedMinutes = 0;
        $totalOvertimeMinutes = 0;
        $totalLateMinutes = 0;
        $totalEarlyLeaveMinutes = 0;

        foreach ($attendances as $att) {
            $status = strtolower($att->status);
            if ($status === 'present' || $status === 'late') {
                $presentDays++;
            }
            if ($att->late_minutes > 0 || $status === 'late') {
                $lateCount++;
            }
            if ($status === 'absent') {
                $absentCount++;
            }
            if ($status === 'leave') {
                $leaveCount++;
            }
            if ($status === 'holiday') {
                $holidayCount++;
            }

            $totalWorkedMinutes += ($att->worked_minutes ?? 0);
            $totalOvertimeMinutes += ($att->overtime_minutes ?? 0);
            $totalLateMinutes += ($att->late_minutes ?? 0);
            $totalEarlyLeaveMinutes += ($att->early_leave_minutes ?? 0);
        }

        $workedHours = round($totalWorkedMinutes / 60, 2);
        $overtimeHours = round($totalOvertimeMinutes / 60, 2);

        // ─── PAYROLL FINANCIAL FORMULAS ──────────────────────────────────────
        $basicSalary = (float) $employee->basic_salary;
        
        // Assuming standard 22 working days per month for hourly rate calculation
        $standardWorkingDays = 22;
        $hourlyRate = $standardWorkingDays > 0 ? ($basicSalary / ($standardWorkingDays * 8)) : 0;

        // Overtime Pay (1.5x hourly rate)
        $overtimePay = round($overtimeHours * $hourlyRate * 1.5, 2);

        // Deductions: Late penalty (e.g., $0.50 per late minute or flat fee)
        $lateDeduction = round($totalLateMinutes * ($hourlyRate / 60), 2);
        $earlyLeaveDeduction = round($totalEarlyLeaveMinutes * ($hourlyRate / 60), 2);

        $totalDeductions = $lateDeduction + $earlyLeaveDeduction;
        $allowances = 0; // Configurable allowances
        $netSalary = max(0, $basicSalary + $allowances + $overtimePay - $totalDeductions);

        return Payroll::updateOrCreate(
            [
                'employee_id'  => $employeeId,
                'period_month' => $periodMonth,
            ],
            [
                'working_days'          => $standardWorkingDays,
                'present_days'          => $presentDays,
                'late_count'            => $lateCount,
                'absent_count'          => $absentCount,
                'leave_count'           => $leaveCount,
                'holiday_count'         => $holidayCount,
                'worked_hours'          => $workedHours,
                'overtime_hours'        => $overtimeHours,
                'basic_salary'          => $basicSalary,
                'allowances'            => $allowances,
                'deductions'            => $totalDeductions,
                'overtime_pay'          => $overtimePay,
                'late_deduction'        => $lateDeduction,
                'early_leave_deduction' => $earlyLeaveDeduction,
                'net_salary'            => $netSalary,
                'status'                => 'draft',
            ]
        );
    }
}
