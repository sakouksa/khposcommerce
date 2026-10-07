<?php

namespace App\Services\Employee;

use App\Repositories\Employee\AttendanceRepository;
use App\Models\Employee\Attendance;
use App\Models\Employee\Employee;
use App\Models\Employee\Shift;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AttendanceService
{
    public function __construct(
        private readonly AttendanceRepository $repository,
        private readonly AttendanceCalculationService $calcService,
        private readonly DeviceLockService $deviceLockService,
        private readonly QrAttendanceService $qrService,
        private readonly PayrollSyncService $payrollSyncService
    ) {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $filters = [], string $sort = 'attendance_date', string $order = 'desc'): LengthAwarePaginator
    {
        return $this->repository->paginateWithFilters($filters, $perPage, $sort, $order);
    }

    public function getById(int|string $id, array $relations = []): Attendance
    {
        return $this->repository->findById($id, relations: $relations);
    }

    /**
     * Mobile QR Scan Check-In or Check-Out endpoint handler.
     */
    public function scanQrCode(array $data, Employee $employee): Attendance
    {
        $qrToken = $data['qr_token'];
        $deviceId = $data['device_id'];
        $deviceName = $data['device_name'] ?? 'Mobile Device';
        $devicePlatform = strtolower($data['device_platform'] ?? 'android');
        $deviceIp = $data['device_ip'] ?? request()->ip();
        $gpsLat = $data['gps_latitude'] ?? null;
        $gpsLng = $data['gps_longitude'] ?? null;
        $rawScanType = isset($data['type']) ? strtolower(trim($data['type'])) : null;

        // 1. Device Lock Validation (1 Employee = 1 Device)
        $this->deviceLockService->validateOrRegisterDevice(
            $employee->id,
            $deviceId,
            $deviceName,
            $devicePlatform,
            $deviceIp
        );

        // 2. Validate Encrypted QR Token, Expiry, DB Active Session, and Geofence/Wi-Fi
        $qrPayload = $this->qrService->validateQrToken(
            $qrToken,
            $employee->company_id,
            $employee->branch_id,
            [
                'gps_latitude'      => $gpsLat,
                'gps_longitude'     => $gpsLng,
                'device_wifi_ssid'  => $data['device_wifi_ssid'] ?? null,
                'employee_shift_id' => $employee->shift_id ?? null,
            ]
        );

        $attendanceDate = $qrPayload['date'] ?? Carbon::now()->format('Y-m-d');
        $shiftId = $qrPayload['shift_id'] ?? $data['shift_id'] ?? null;
        $shift = $shiftId ? Shift::find($shiftId) : null;

        // 3. Find existing attendance record for today
        $existing = Attendance::where('employee_id', $employee->id)
            ->where(function($q) use ($attendanceDate) {
                $q->where('attendance_date', $attendanceDate)
                  ->orWhere('date', $attendanceDate);
            })
            ->first();

        // 4. Resolve scan type (Auto-detect check-in vs check-out for Standee checkpoints)
        if (empty($rawScanType) || $rawScanType === 'auto') {
            if (!$existing || empty($existing->check_in)) {
                $scanType = 'check_in';
            } elseif (!empty($existing->check_in) && empty($existing->check_out)) {
                $scanType = 'check_out';
            } else {
                throw ValidationException::withMessages([
                    'attendance' => ["អ្នកបានបំពេញវត្តមានថ្ងៃនេះរួចរាល់ហើយ (ចូល: {$existing->check_in} | ចេញ: {$existing->check_out})។"]
                ]);
            }
        } else {
            $scanType = $rawScanType;
        }

        $currentTime = Carbon::now()->format('H:i:s');
        $currentTimestamp = Carbon::now();
        $checkpointName = $qrPayload['checkpoint_name'] ?? 'ច្រកចូលក្រុមហ៊ុន';

        if ($scanType === 'check_in') {
            // Anti-Duplicate Check-in check
            if ($existing && $existing->check_in) {
                throw ValidationException::withMessages([
                    'check_in' => ["បានកត់ត្រាវត្តមានចូលរួចហើយនៅម៉ោង {$existing->check_in}។"]
                ]);
            }

            // Window check for Check-In if shift has bounds
            if ($shift && $shift->max_check_in_time) {
                $cutoff = Carbon::parse("{$attendanceDate} {$shift->max_check_in_time}");
                if ($currentTimestamp->greaterThan($cutoff)) {
                    throw ValidationException::withMessages([
                        'check_in' => ['Attendance window closed for check-in on this shift.']
                    ]);
                }
            }

            $calcResults = $this->calcService->calculate(
                $currentTime,
                null,
                $shift,
                $attendanceDate
            );

            $status = ($calcResults['late_minutes'] > 0) ? 'late' : 'present';

            $attendanceData = [
                'company_id'          => $employee->company_id,
                'branch_id'           => $employee->branch_id,
                'employee_id'         => $employee->id,
                'department_id'       => $employee->department_id,
                'position_id'         => $employee->position_id,
                'attendance_date'     => $attendanceDate,
                'date'                => $attendanceDate,
                'shift_id'            => $shiftId,
                'check_in'            => $currentTime,
                'scheduled_check_in'  => $shift ? Carbon::parse("{$attendanceDate} {$shift->start_time}") : null,
                'scheduled_check_out' => $shift ? Carbon::parse("{$attendanceDate} {$shift->end_time}") : null,
                'late_minutes'        => $calcResults['late_minutes'],
                'worked_minutes'      => 0,
                'break_minutes'       => $calcResults['break_minutes'],
                'status'              => $status,
                'attendance_type'     => 'regular',
                'device_id'           => $deviceId,
                'device_name'         => $deviceName,
                'device_platform'     => $devicePlatform,
                'device_ip'           => $deviceIp,
                'gps_latitude'        => $gpsLat,
                'gps_longitude'       => $gpsLng,
                'qr_token'            => $qrToken,
                'check_in_method'     => 'qr_scan',
                'notes'               => "ចូលតាម: {$checkpointName}",
                'is_manual'           => false,
            ];

            if ($existing) {
                $existing->update($attendanceData);
                $attendance = $existing;
            } else {
                $attendance = Attendance::create($attendanceData);
            }
        } else {
            // Check-out scan
            if (!$existing || !$existing->check_in) {
                throw ValidationException::withMessages([
                    'check_out' => ['មិនអាចស្កេនចេញបានទេ ដោយសារពុំទាន់បានស្កេនចូលនៅឡើយ (Cannot check out before check-in).']
                ]);
            }

            if ($existing->check_out) {
                throw ValidationException::withMessages([
                    'check_out' => ["បានកត់ត្រាវត្តមានចេញរួចហើយនៅម៉ោង {$existing->check_out}។"]
                ]);
            }

            $calcResults = $this->calcService->calculate(
                $existing->check_in,
                $currentTime,
                $existing->shift ?? $shift,
                $attendanceDate
            );

            $existingNotes = $existing->notes ? "{$existing->notes} | " : '';
            $existing->update([
                'check_out'           => $currentTime,
                'late_minutes'        => $calcResults['late_minutes'],
                'early_leave_minutes' => $calcResults['early_leave_minutes'],
                'worked_minutes'      => $calcResults['worked_minutes'],
                'overtime_minutes'    => $calcResults['overtime_minutes'],
                'check_out_method'    => 'qr_scan',
                'gps_latitude'        => $gpsLat ?? $existing->gps_latitude,
                'gps_longitude'       => $gpsLng ?? $existing->gps_longitude,
                'notes'               => "{$existingNotes}ចេញតាម: {$checkpointName}",
            ]);

            $attendance = $existing->fresh();
        }

        // Real-time Payroll Aggregation Trigger
        $this->payrollSyncService->syncEmployeePayroll($employee->id, Carbon::parse($attendanceDate)->format('Y-m'));

        return $attendance->load(['employee', 'department', 'position', 'shift', 'company', 'branch']);
    }

    public function create(array $data): Attendance
    {
        $attendanceDate = $data['attendance_date'] ?? $data['date'] ?? Carbon::now()->format('Y-m-d');
        $data['attendance_date'] = $attendanceDate;
        $data['date'] = $attendanceDate;

        $shift = isset($data['shift_id']) ? Shift::find($data['shift_id']) : null;
        $checkIn = $data['check_in'] ?? null;
        $checkOut = $data['check_out'] ?? null;

        $calc = $this->calcService->calculate($checkIn, $checkOut, $shift, $attendanceDate);
        $data = array_merge($data, $calc);

        if ($checkIn && !isset($data['status'])) {
            $data['status'] = ($calc['late_minutes'] > 0) ? 'late' : 'present';
        }

        $record = $this->repository->create($data);

        // Real-time Payroll Sync
        if (isset($data['employee_id'])) {
            $this->payrollSyncService->syncEmployeePayroll((int)$data['employee_id'], Carbon::parse($attendanceDate)->format('Y-m'));
        }

        return $record;
    }

    public function update(int|string $id, array $data): Attendance
    {
        $existing = $this->repository->findById($id);
        $attendanceDate = $data['attendance_date'] ?? $data['date'] ?? $existing->attendance_date ?? $existing->date ?? Carbon::now()->format('Y-m-d');

        $shiftId = $data['shift_id'] ?? $existing->shift_id;
        $shift = $shiftId ? Shift::find($shiftId) : null;
        $checkIn = $data['check_in'] ?? $existing->check_in;
        $checkOut = $data['check_out'] ?? $existing->check_out;

        $calc = $this->calcService->calculate($checkIn, $checkOut, $shift, (string)$attendanceDate);
        $data = array_merge($data, $calc);

        $record = $this->repository->update($id, $data);

        // Real-time Payroll Sync
        $this->payrollSyncService->syncEmployeePayroll((int)$existing->employee_id, Carbon::parse($attendanceDate)->format('Y-m'));

        return $record;
    }

    public function delete(int|string $id): bool
    {
        $existing = $this->repository->findById($id);
        $result = $this->repository->delete($id);
        if ($existing && $existing->employee_id) {
            $this->payrollSyncService->syncEmployeePayroll((int)$existing->employee_id, Carbon::now()->format('Y-m'));
        }
        return $result;
    }

    public function bulkDelete(array $ids): int
    {
        return $this->repository->bulkDelete($ids);
    }

    /**
     * Aggregated Dashboard Statistics for Admin Dashboard cards.
     */
    public function getDashboardStats(?int $companyId = null, ?int $branchId = null, ?string $date = null): array
    {
        $today = $date ?? Carbon::now()->format('Y-m-d');

        $query = Attendance::query()
            ->when($companyId, fn($q) => $q->where('company_id', $companyId))
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where(function($q) use ($today) {
                $q->where('attendance_date', $today)->orWhere('date', $today);
            });

        $records = (clone $query)->get();

        $presentCount = $records->whereIn('status', ['present'])->count();
        $lateCount = $records->whereIn('status', ['late'])->count();
        $absentCount = $records->whereIn('status', ['absent'])->count();
        $leaveCount = $records->whereIn('status', ['leave'])->count();
        $holidayCount = $records->whereIn('status', ['holiday'])->count();

        $totalWorkedMins = $records->sum('worked_minutes');
        $totalOvertimeMins = $records->sum('overtime_minutes');

        $checkInTimes = $records->pluck('check_in')->filter()->toArray();
        $checkOutTimes = $records->pluck('check_out')->filter()->toArray();

        $avgCheckIn = '--:--';
        if (count($checkInTimes) > 0) {
            $totalSecs = 0;
            foreach ($checkInTimes as $t) {
                $totalSecs += Carbon::parse($t)->secondsSinceMidnight();
            }
            $avgSecs = (int) ($totalSecs / count($checkInTimes));
            $avgCheckIn = Carbon::today()->addSeconds($avgSecs)->format('H:i');
        }

        $avgCheckOut = '--:--';
        if (count($checkOutTimes) > 0) {
            $totalSecs = 0;
            foreach ($checkOutTimes as $t) {
                $totalSecs += Carbon::parse($t)->secondsSinceMidnight();
            }
            $avgSecs = (int) ($totalSecs / count($checkOutTimes));
            $avgCheckOut = Carbon::today()->addSeconds($avgSecs)->format('H:i');
        }

        return [
            'today_date'           => $today,
            'present'              => $presentCount,
            'late'                 => $lateCount,
            'absent'               => $absentCount,
            'leave'                => $leaveCount,
            'holiday'              => $holidayCount,
            'worked_hours_today'   => round($totalWorkedMins / 60, 2),
            'overtime_hours_today' => round($totalOvertimeMins / 60, 2),
            'avg_check_in'         => $avgCheckIn,
            'avg_check_out'        => $avgCheckOut,
        ];
    }

    /**
     * Monthly Timesheet Summary for all active employees.
     */
    public function getMonthlySummary(string $periodMonth, ?int $companyId = null, ?int $branchId = null): array
    {
        $startDate = Carbon::parse($periodMonth . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $standardWorkingDays = 22;

        $empQuery = Employee::with(['department', 'position', 'branch'])
            ->where('status', 'active');
        if ($companyId) $empQuery->where('company_id', $companyId);
        if ($branchId) $empQuery->where('branch_id', $branchId);

        $employees = $empQuery->orderBy('id', 'asc')->get();

        $attendances = Attendance::where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('attendance_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                  ->orWhereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
            })
            ->get();

        $items = [];
        $totalOvertimeHours = 0.0;
        $totalLateIncidents = 0;
        $totalPresentCount = 0;
        $perfectAttendanceCount = 0;

        foreach ($employees as $emp) {
            $empAtt = $attendances->where('employee_id', $emp->id);

            $presentDays = $empAtt->whereIn('status', ['present', 'late'])->count();
            $lateDays = $empAtt->where('status', 'late')->count();
            $absentDays = $empAtt->where('status', 'absent')->count();
            $leaveDays = $empAtt->where('status', 'leave')->count();

            $workedMins = $empAtt->sum('worked_minutes');
            $overtimeMins = $empAtt->sum('overtime_minutes');
            $lateMins = $empAtt->sum('late_minutes');

            $workedHours = round($workedMins / 60, 1);
            $overtimeHours = round($overtimeMins / 60, 1);

            $rate = $standardWorkingDays > 0 ? round(($presentDays / $standardWorkingDays) * 100, 1) : 0;
            if ($rate > 100) $rate = 100.0;

            if ($rate >= 100 && $lateDays === 0) {
                $perfectAttendanceCount++;
            }

            $totalOvertimeHours += $overtimeHours;
            $totalLateIncidents += $lateDays;
            $totalPresentCount += $presentDays;

            $items[] = [
                'employee_id'        => $emp->id,
                'employee_name'      => $emp->name,
                'employee_number'    => $emp->employee_number,
                'photo'              => $emp->photo,
                'department'         => $emp->department?->name ?? 'General',
                'position'           => $emp->position?->name ?? 'Staff',
                'scheduled_days'     => $standardWorkingDays,
                'present_days'       => $presentDays,
                'late_days'          => $lateDays,
                'late_minutes'       => $lateMins,
                'absent_days'        => $absentDays,
                'leave_days'         => $leaveDays,
                'worked_hours'       => $workedHours,
                'overtime_hours'     => $overtimeHours,
                'attendance_rate'    => $rate,
            ];
        }

        $empCount = $employees->count();
        $avgAttendanceRate = $empCount > 0 ? round(collect($items)->avg('attendance_rate'), 1) : 0.0;

        return [
            'period_month'             => $periodMonth,
            'total_employees'          => $empCount,
            'avg_attendance_rate'      => $avgAttendanceRate,
            'perfect_attendance_count' => $perfectAttendanceCount,
            'total_overtime_hours'     => round($totalOvertimeHours, 1),
            'total_late_incidents'     => $totalLateIncidents,
            'items'                    => $items,
        ];
    }
}
