<?php

namespace App\Http\Resources\Employee;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'company_id'           => $this->company_id,
            'branch_id'            => $this->branch_id,
            'employee_id'          => $this->employee_id,
            'department_id'        => $this->department_id,
            'position_id'          => $this->position_id,
            'shift_id'             => $this->shift_id,
            'attendance_date'      => $this->attendance_date ? $this->attendance_date->format('Y-m-d') : ($this->date ? $this->date->format('Y-m-d') : null),
            'date'                 => $this->date ? $this->date->format('Y-m-d') : ($this->attendance_date ? $this->attendance_date->format('Y-m-d') : null),
            'check_in'             => $this->check_in,
            'check_out'            => $this->check_out,
            'scheduled_check_in'   => $this->scheduled_check_in,
            'scheduled_check_out'  => $this->scheduled_check_out,
            'late_minutes'         => $this->late_minutes ?? 0,
            'early_leave_minutes'  => $this->early_leave_minutes ?? 0,
            'worked_minutes'       => $this->worked_minutes ?? 0,
            'break_minutes'        => $this->break_minutes ?? 60,
            'overtime_minutes'     => $this->overtime_minutes ?? 0,
            'status'               => $this->status,
            'attendance_type'      => $this->attendance_type ?? 'regular',
            'device_id'            => $this->device_id,
            'device_name'          => $this->device_name,
            'device_platform'      => $this->device_platform ?? 'android',
            'device_ip'            => $this->device_ip,
            'gps_latitude'         => $this->gps_latitude,
            'gps_longitude'        => $this->gps_longitude,
            'check_in_method'      => $this->check_in_method ?? 'qr_scan',
            'check_out_method'     => $this->check_out_method ?? 'qr_scan',
            'is_manual'            => (bool) $this->is_manual,
            'approved_by'          => $this->approved_by,
            'approved_at'          => $this->approved_at,
            'notes'                => $this->notes,
            'working_hours'        => $this->worked_hours_formatted,
            'late_time'            => $this->late_time_formatted,
            'overtime_formatted'   => $this->overtime_formatted,
            'employee'             => $this->whenLoaded('employee', fn() => $this->employee),
            'department'           => $this->whenLoaded('department', fn() => $this->department),
            'position'             => $this->whenLoaded('position', fn() => $this->position),
            'shift'                => $this->whenLoaded('shift', fn() => $this->shift),
            'company'              => $this->whenLoaded('company', fn() => $this->company),
            'branch'               => $this->whenLoaded('branch', fn() => $this->branch),
            'created_at'           => $this->created_at,
            'updated_at'           => $this->updated_at,
        ];
    }
}
