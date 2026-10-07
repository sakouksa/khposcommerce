<?php

namespace App\Services\Employee;

use App\Models\Employee\Shift;
use Carbon\Carbon;

class AttendanceCalculationService
{
    /**
     * Calculate Worked Minutes, Late Minutes, Early Leave, and Overtime Minutes.
     *
     * Example:
     * Shift Start: 08:00
     * Grace: 10m
     * Check-in: 08:07 => Late: 0
     * Check-in: 08:11 => Late: 1 minute (08:11 - 08:10)
     * Check-in: 08:25 => Late: 15 minutes (08:25 - 08:10)
     * Check-out: 16:40 vs Shift End 17:00 => Early Leave: 20m
     * Check-out: 18:30 vs Shift End 17:00 => Overtime: 90m
     */
    public function calculate(
        ?string $checkInTime,
        ?string $checkOutTime,
        ?Shift $shift,
        string $attendanceDate
    ): array {
        $lateMinutes = 0;
        $earlyLeaveMinutes = 0;
        $workedMinutes = 0;
        $overtimeMinutes = 0;
        $breakMinutes = $shift ? $shift->break_minutes : 60;

        if (!$checkInTime) {
            return [
                'late_minutes'        => 0,
                'early_leave_minutes' => 0,
                'worked_minutes'      => 0,
                'overtime_minutes'    => 0,
                'break_minutes'       => $breakMinutes,
            ];
        }

        $checkInDt = Carbon::parse("{$attendanceDate} {$checkInTime}");
        
        // 1. Calculate Late Minutes
        if ($shift && $shift->start_time) {
            $shiftStartDt = Carbon::parse("{$attendanceDate} {$shift->start_time}");
            $graceMinutes = $shift->late_grace_minutes ?? 10;
            $graceDeadlineDt = (clone $shiftStartDt)->addMinutes($graceMinutes);

            if ($checkInDt->greaterThan($graceDeadlineDt)) {
                $lateMinutes = (int) $graceDeadlineDt->diffInMinutes($checkInDt);
            }
        }

        // 2. Calculate Check-out metrics if check-out time is supplied
        if ($checkOutTime) {
            $checkOutDt = Carbon::parse("{$attendanceDate} {$checkOutTime}");
            
            // Handle overnight shifts where check_out is past midnight
            if ($checkOutDt->lessThan($checkInDt)) {
                $checkOutDt->addDay();
            }

            // Total Duration in Minutes
            $totalDurationMins = (int) $checkInDt->diffInMinutes($checkOutDt);
            $workedMinutes = max(0, $totalDurationMins - $breakMinutes);

            if ($shift && $shift->end_time) {
                $shiftEndDt = Carbon::parse("{$attendanceDate} {$shift->end_time}");
                if ($shiftEndDt->lessThan($shiftStartDt ?? $checkInDt)) {
                    $shiftEndDt->addDay();
                }

                // Early Leave
                if ($checkOutDt->lessThan($shiftEndDt)) {
                    $earlyLeaveMinutes = (int) $checkOutDt->diffInMinutes($shiftEndDt);
                }

                // Overtime
                if ($checkOutDt->greaterThan($shiftEndDt)) {
                    $rawOvertime = (int) $shiftEndDt->diffInMinutes($checkOutDt);
                    $maxOvertime = $shift->max_overtime_minutes ?? 240;
                    $overtimeMinutes = min($rawOvertime, $maxOvertime);
                }
            }
        }

        return [
            'late_minutes'        => $lateMinutes,
            'early_leave_minutes' => $earlyLeaveMinutes,
            'worked_minutes'      => $workedMinutes,
            'overtime_minutes'    => $overtimeMinutes,
            'break_minutes'       => $breakMinutes,
        ];
    }
}
