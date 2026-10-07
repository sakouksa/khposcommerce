<?php

namespace App\Services\Employee;

use App\Models\Employee\EmployeeDevice;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class DeviceLockService
{
    /**
     * Verify or register the device ID for an employee.
     * Throws ValidationException if employee attempts scanning from a unauthorized device.
     */
    public function validateOrRegisterDevice(
        int $employeeId,
        string $deviceId,
        ?string $deviceName = null,
        ?string $devicePlatform = 'android',
        ?string $deviceIp = null
    ): EmployeeDevice {
        $existing = EmployeeDevice::where('employee_id', $employeeId)->first();

        if ($existing) {
            // Check if device matches
            if ($existing->device_id !== $deviceId) {
                throw ValidationException::withMessages([
                    'device_id' => [
                        "Attendance rejected: Attendance already recorded on another registered device ({$existing->device_name}). Device switching is restricted."
                    ]
                ]);
            }

            // Update last used timestamp
            $existing->update([
                'device_name'     => $deviceName ?? $existing->device_name,
                'device_platform' => $devicePlatform ?? $existing->device_platform,
                'device_ip'       => $deviceIp ?? $existing->device_ip,
                'last_used_at'    => Carbon::now(),
            ]);

            return $existing;
        }

        // First scan: Bind & Lock this device to the employee
        return EmployeeDevice::create([
            'employee_id'     => $employeeId,
            'device_id'       => $deviceId,
            'device_name'     => $deviceName ?? 'Registered Device',
            'device_platform' => $devicePlatform ?? 'android',
            'device_ip'       => $deviceIp,
            'is_locked'       => true,
            'last_used_at'    => Carbon::now(),
        ]);
    }
}
