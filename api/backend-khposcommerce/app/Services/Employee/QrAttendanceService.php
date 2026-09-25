<?php

namespace App\Services\Employee;

use App\Models\Employee\AttendanceQrSession;
use App\Models\Employee\Shift;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class QrAttendanceService
{
    /**
     * Generate or retrieve a Company Entrance QR (Attendance Standee).
     */
    public function generateEntranceQr(array $params): array
    {
        $companyId = (int) ($params['company_id'] ?? Company::first()?->id ?? 1);
        $branchId = (int) ($params['branch_id'] ?? Branch::where('company_id', $companyId)->first()?->id ?? 1);
        $shiftId = !empty($params['shift_id']) ? (int) $params['shift_id'] : null;
        $forceRegenerate = !empty($params['force_regenerate']);

        return $this->generateDynamicQr(
            $companyId,
            $branchId,
            $shiftId,
            31536000, // 1 Year interval for Entrance Standee
            true,     // isStandee = true
            [
                'checkpoint_name'  => $params['checkpoint_name'] ?? null,
                'radius_meters'    => isset($params['radius_meters']) ? (int) $params['radius_meters'] : 50,
                'wifi_ssid'        => $params['wifi_ssid'] ?? null,
                'gps_latitude'     => $params['gps_latitude'] ?? null,
                'gps_longitude'    => $params['gps_longitude'] ?? null,
                'force_regenerate' => $forceRegenerate,
            ]
        );
    }

    /**
     * Generate dynamic QR token for kiosk display or static entrance standee.
     */
    public function generateDynamicQr(
        int $companyId,
        int $branchId,
        ?int $shiftId = null,
        int $intervalSeconds = 30,
        bool $isStandee = false,
        array $extra = []
    ): array {
        $forceRegenerate = !empty($extra['force_regenerate']);

        $checkpointName = $extra['checkpoint_name'] ?? ($isStandee ? 'ច្រកចូលក្រុមហ៊ុន (HQ Entrance Checkpoint)' : 'Dynamic Kiosk Checkpoint');
        $radiusMeters = isset($extra['radius_meters']) ? (int) $extra['radius_meters'] : 50;
        $wifiSsid = $extra['wifi_ssid'] ?? null;
        $gpsLat = $extra['gps_latitude'] ?? null;
        $gpsLng = $extra['gps_longitude'] ?? null;

        // For Standee: if not forced to regenerate, check if an existing active session matches the exact parameters
        if ($isStandee && !$forceRegenerate) {
            $existing = AttendanceQrSession::where('company_id', $companyId)
                ->where('branch_id', $branchId)
                ->where('is_standee', true)
                ->where('is_active', true)
                ->whereNull('revoked_at')
                ->where('qr_expired_at', '>', now())
                ->where(function ($q) use ($shiftId) {
                    if ($shiftId === null) {
                        $q->whereNull('shift_id');
                    } else {
                        $q->where('shift_id', $shiftId);
                    }
                })
                ->latest()
                ->first();

            if ($existing) {
                $wifiMatches = empty($wifiSsid) || strcasecmp(trim($existing->wifi_ssid ?? ''), trim($wifiSsid)) === 0;
                $radiusMatches = empty($extra['radius_meters']) || (int) $existing->radius_meters === (int) $radiusMeters;
                $nameMatches = empty($extra['checkpoint_name']) || trim($existing->checkpoint_name ?? '') === trim($checkpointName);

                if ($wifiMatches && $radiusMatches && $nameMatches) {
                    return $this->formatSessionResponse($existing);
                }
            }
        }

        // If force regenerate or parameters changed, revoke older active standees for this scope
        if ($isStandee) {
            AttendanceQrSession::where('company_id', $companyId)
                ->where('branch_id', $branchId)
                ->where('is_standee', true)
                ->where('is_active', true)
                ->update([
                    'is_active'  => false,
                    'revoked_at' => Carbon::now(),
                ]);
        }

        $uuid = (string) Str::uuid();
        $expiresAt = $isStandee
            ? Carbon::now()->addYear()
            : Carbon::now()->addSeconds($intervalSeconds + 5); // 5s buffer for latency
        $date = $isStandee ? null : Carbon::now()->format('Y-m-d');

        $company = Company::find($companyId);
        $branch = Branch::find($branchId);
        $shift = $shiftId ? Shift::find($shiftId) : null;

        $payload = [
            'type'            => $isStandee ? 'entrance_standee' : 'dynamic_kiosk',
            'company_id'      => $companyId,
            'company_name'    => $company?->name ?? 'NexTech Cambodia Co., Ltd. (HQ)',
            'branch_id'       => $branchId,
            'branch_name'     => $branch?->name ?? 'NexTech Cambodia (HQ)',
            'shift_id'        => $shiftId,
            'shift_name'      => $shift?->name,
            'date'            => $date,
            'random_uuid'     => $uuid,
            'checkpoint_name' => $checkpointName,
            'radius_meters'   => $radiusMeters,
            'wifi_ssid'       => $wifiSsid,
            'gps_latitude'    => $gpsLat ?? $branch?->latitude,
            'gps_longitude'   => $gpsLng ?? $branch?->longitude,
            'expires_at'      => $expiresAt->timestamp,
        ];

        $jsonPayload = json_encode($payload);
        $signature = hash_hmac('sha256', $jsonPayload, config('app.key'));
        $payload['signature'] = $signature;

        $encryptedToken = Crypt::encrypt($payload);

        $session = AttendanceQrSession::create([
            'company_id'       => $companyId,
            'branch_id'        => $branchId,
            'shift_id'         => $shiftId,
            'qr_token'         => $encryptedToken,
            'random_uuid'      => $uuid,
            'secret_signature' => $signature,
            'qr_expired_at'    => $expiresAt,
            'interval_seconds' => $isStandee ? 31536000 : $intervalSeconds,
            'is_standee'       => $isStandee,
            'checkpoint_name'  => $checkpointName,
            'radius_meters'    => $radiusMeters,
            'wifi_ssid'        => $wifiSsid,
            'gps_latitude'     => $gpsLat,
            'gps_longitude'    => $gpsLng,
            'is_active'        => true,
        ]);

        return $this->formatSessionResponse($session);
    }

    /**
     * Retrieve current active Company Entrance QR for a specific branch.
     */
    public function getActiveEntranceQr(int $companyId, int $branchId): ?array
    {
        $session = AttendanceQrSession::where('company_id', $companyId)
            ->where('branch_id', $branchId)
            ->where('is_standee', true)
            ->where('is_active', true)
            ->whereNull('revoked_at')
            ->where('qr_expired_at', '>', now())
            ->latest()
            ->first();

        return $session ? $this->formatSessionResponse($session) : null;
    }

    /**
     * Revoke existing Company Entrance QR for a branch.
     */
    public function revokeEntranceQr(int $companyId, int $branchId, ?int $sessionId = null): bool
    {
        $query = AttendanceQrSession::where('company_id', $companyId)
            ->where('branch_id', $branchId)
            ->where('is_standee', true)
            ->where('is_active', true);

        if ($sessionId) {
            $query->where('id', $sessionId);
        }

        return (bool) $query->update([
            'is_active'  => false,
            'revoked_at' => Carbon::now(),
        ]);
    }

    /**
     * Decrypt and securely validate QR payload token.
     */
    public function validateQrToken(
        string $encryptedToken,
        int $employeeCompanyId,
        int $employeeBranchId,
        array $scanData = []
    ): array {
        try {
            $payload = Crypt::decrypt($encryptedToken);
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'qr_token' => ['Invalid or tampered QR Code token.']
            ]);
        }

        if (!isset($payload['expires_at'], $payload['signature'], $payload['company_id'], $payload['branch_id'])) {
            throw ValidationException::withMessages([
                'qr_token' => ['Malformed QR Code structure.']
            ]);
        }

        // 1. Check expiration
        if (Carbon::now()->timestamp > $payload['expires_at']) {
            throw ValidationException::withMessages([
                'qr_token' => ['QR Code នេះផុតកំណត់ហើយ សូមទាក់ទងរដ្ឋបាល (QR Code has expired).']
            ]);
        }

        // 2. Validate HMAC signature
        $unsignedPayload = $payload;
        unset($unsignedPayload['signature']);
        $expectedSignature = hash_hmac('sha256', json_encode($unsignedPayload), config('app.key'));

        if (!hash_equals($expectedSignature, $payload['signature'])) {
            throw ValidationException::withMessages([
                'qr_token' => ['QR Code digital signature verification failed.']
            ]);
        }

        // 3. Verify Database Session Status (Prevent revoked QR reuse)
        $session = AttendanceQrSession::where('random_uuid', $payload['random_uuid'] ?? '')
            ->orWhere('qr_token', $encryptedToken)
            ->first();

        if ($session) {
            if (!$session->is_active || $session->revoked_at !== null) {
                throw ValidationException::withMessages([
                    'qr_token' => ['QR Code ត្រូវបាន Admin ផ្លាស់ប្តូរ ឬលុបចោលរួចហើយ (This QR session was revoked or replaced).']
                ]);
            }
            if ($session->qr_expired_at && Carbon::now()->greaterThan($session->qr_expired_at)) {
                throw ValidationException::withMessages([
                    'qr_token' => ['QR Code នេះផុតកំណត់អាយុកាលប្រើប្រាស់ហើយ (QR session expired in database).']
                ]);
            }
        }

        // 4. Verify Company & Branch Match
        if ($payload['company_id'] != $employeeCompanyId) {
            throw ValidationException::withMessages([
                'company_id' => ['QR Code នេះជាកម្មសិទ្ធិរបស់ក្រុមហ៊ុនផ្សេង (QR belongs to another company). Access denied.']
            ]);
        }

        if ($payload['branch_id'] != $employeeBranchId) {
            throw ValidationException::withMessages([
                'branch_id' => ['QR Code នេះសម្រាប់ទីតាំងសាខាផ្សេង (QR belongs to another branch location). Access denied.']
            ]);
        }

        // 5. Shift Match if strictly designated
        if (!empty($payload['shift_id']) && !empty($scanData['employee_shift_id'])) {
            if ($payload['shift_id'] != $scanData['employee_shift_id']) {
                throw ValidationException::withMessages([
                    'shift_id' => ['QR Code នេះសម្រាប់វេនការងារជាក់លាក់ (Restricted to specific shift).']
                ]);
            }
        }

        // 6. Geofence Radius Verification (if checkpoint coordinates exist and mobile app sent GPS)
        $checkpointLat = $session?->gps_latitude ?? $payload['gps_latitude'] ?? null;
        $checkpointLng = $session?->gps_longitude ?? $payload['gps_longitude'] ?? null;
        $allowedRadius = (int) ($session?->radius_meters ?? $payload['radius_meters'] ?? 50);
        $deviceLat = $scanData['gps_latitude'] ?? null;
        $deviceLng = $scanData['gps_longitude'] ?? null;

        if ($checkpointLat !== null && $checkpointLng !== null && $deviceLat !== null && $deviceLng !== null) {
            $distanceMeters = $this->calculateHaversineDistance(
                (float) $checkpointLat,
                (float) $checkpointLng,
                (float) $deviceLat,
                (float) $deviceLng
            );

            // Allowed threshold + 25m tolerance for mobile GPS hardware jitter
            $maxAllowed = $allowedRadius + 25;
            if ($distanceMeters > $maxAllowed) {
                throw ValidationException::withMessages([
                    'gps' => ["ទីតាំងរបស់អ្នកនៅឆ្ងាយពីច្រកក្រុមហ៊ុន (ចម្ងាយ: " . round($distanceMeters) . " ម៉ែត្រ, កំណត់មិនឱ្យលើស: {$allowedRadius} ម៉ែត្រ)។"]
                ]);
            }
        }

        // 7. Wi-Fi SSID Verification
        $requiredWifi = $session?->wifi_ssid ?? $payload['wifi_ssid'] ?? null;
        $deviceWifi = $scanData['device_wifi_ssid'] ?? null;
        if (!empty($requiredWifi) && !empty($deviceWifi)) {
            if (strcasecmp(trim($requiredWifi), trim($deviceWifi)) !== 0) {
                throw ValidationException::withMessages([
                    'wifi' => ["សូមភ្ជាប់បណ្តាញ Wi-Fi ក្រុមហ៊ុន ({$requiredWifi}) មុនពេលស្កេនវត្តមាន។"]
                ]);
            }
        }

        // Return rich payload data
        return array_merge($payload, [
            'session_id'      => $session?->id,
            'is_standee'      => $session?->is_standee ?? ($payload['type'] ?? '') === 'entrance_standee',
            'checkpoint_name' => $session?->checkpoint_name ?? $payload['checkpoint_name'] ?? 'ច្រកចូលក្រុមហ៊ុន',
        ]);
    }

    /**
     * Calculate Distance between two GPS points using Haversine formula (meters).
     */
    public function calculateHaversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // in meters
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Format session object into rich standardized response.
     */
    private function formatSessionResponse(AttendanceQrSession $session): array
    {
        $company = $session->company ?: Company::find($session->company_id);
        $branch = $session->branch ?: Branch::find($session->branch_id);
        $shift = $session->shift_id ? ($session->shift ?: Shift::find($session->shift_id)) : null;

        return [
            'session_id'       => $session->id,
            'qr_token'         => $session->qr_token,
            'random_uuid'      => $session->random_uuid,
            'security_key'     => $session->qr_token,
            'is_standee'       => (bool) $session->is_standee,
            'checkpoint_name'  => $session->checkpoint_name ?? 'ច្រកចូលក្រុមហ៊ុន (HQ Entrance Checkpoint)',
            'company_id'       => $session->company_id,
            'company_name'     => $company?->name ?? 'NexTech Cambodia Co., Ltd. (HQ)',
            'company_logo'     => $company?->logo,
            'branch_id'        => $session->branch_id,
            'branch_name'      => $branch?->name ?? 'NexTech Cambodia (HQ)',
            'branch_code'      => $branch?->code ?? 'BR-KH-PNH',
            'branch_address'   => $branch?->address,
            'branch_phone'     => $branch?->phone,
            'shift_id'         => $session->shift_id,
            'shift_name'       => $shift ? $shift->name : 'គ្រប់វេនទាំងអស់ (All Shifts Supported)',
            'radius_meters'    => $session->radius_meters ?? 50,
            'wifi_ssid'        => $session->wifi_ssid ?? ($branch?->code ? "{$branch->code}_STAFF_5G" : 'NEXTECH_STAFF_5G'),
            'gps_latitude'     => $session->gps_latitude,
            'gps_longitude'    => $session->gps_longitude,
            'interval_seconds' => $session->interval_seconds,
            'expires_at'       => $session->qr_expired_at?->toIso8601String(),
            'created_at'       => $session->created_at?->toIso8601String(),
        ];
    }
}

