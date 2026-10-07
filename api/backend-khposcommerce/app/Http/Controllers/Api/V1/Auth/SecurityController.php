<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use App\Models\Auth\JwtRefreshToken;
use App\Models\Log\LoginHistory;
use App\Models\Log\AuditLog;
use App\Models\POS\CashRegister;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SecurityController extends BaseApiController
{
    /**
     * GET /api/v1/security/overview
     */
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id ?: 1;

        $activeSessions = JwtRefreshToken::active()->count();
        $totalDevices = JwtRefreshToken::count();
        $revokedDevices = JwtRefreshToken::where('status', 'revoked')->count();
        $suspiciousDevices = JwtRefreshToken::where('status', 'suspicious')->count();

        $failedLogins24h = LoginHistory::where('success', false)
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        $successfulLogins24h = LoginHistory::where('success', true)
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        $openShifts = DB::table('cash_registers')
            ->where('company_id', $companyId)
            ->where('status', 'open')
            ->count();

        $recentEvents = AuditLog::with('user:id,name,username')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($evt) {
                return [
                    'id'             => $evt->id,
                    'action'         => $evt->event,
                    'module'         => $evt->auditable_type ?: 'Security',
                    'description'    => $evt->new_values['description'] ?? ($evt->event . ' on ' . ($evt->auditable_type ?: 'System')),
                    'ip_address'     => $evt->ip_address,
                    'created_at'     => $evt->created_at?->toIso8601String(),
                    'user'           => [
                        'id'       => $evt->user?->id,
                        'name'     => $evt->user?->name,
                        'username' => $evt->user?->username,
                    ],
                ];
            });

        return $this->successResponse([
            'metrics' => [
                'active_sessions'      => $activeSessions,
                'total_devices'        => $totalDevices,
                'revoked_devices'      => $revokedDevices,
                'suspicious_devices'   => $suspiciousDevices,
                'failed_logins_24h'    => $failedLogins24h,
                'successful_logins_24h'=> $successfulLogins24h,
                'open_shifts'          => $openShifts,
            ],
            'recent_events' => $recentEvents,
        ]);
    }

    /**
     * GET /api/v1/security/settings
     */
    public function settings(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id ?: 1;

        $defaults = [
            'session_timeout_minutes'    => 60,
            'max_failed_attempts'        => 5,
            'lockout_duration_minutes'   => 15,
            'allow_multiple_devices'     => true,
            'max_active_devices'         => 5,
            'pos_require_shift_for_sale' => true,
            'cashier_max_discount'       => 5.0,
            'supervisor_max_discount'    => 15.0,
            'manager_max_discount'       => 30.0,
            'require_manager_for_refund' => true,
            'require_manager_for_void'   => true,
            'audit_logging_enabled'      => true,
        ];

        $saved = DB::table('security_settings')
            ->where('company_id', $companyId)
            ->pluck('value', 'key')
            ->map(function ($val) {
                return json_decode($val, true) ?? $val;
            })
            ->toArray();

        $merged = array_merge($defaults, $saved);

        return $this->successResponse([
            'settings'        => $merged,
            'has_manager_pin' => $user->hasManagerPin(),
        ]);
    }

    /**
     * PUT /api/v1/security/settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && !$user->hasPermissionTo('settings.edit')) {
            return $this->errorResponse('Unauthorized. Admin privilege required.', null, 403);
        }

        $companyId = $user->company_id ?: 1;
        $settings = $request->validate([
            'session_timeout_minutes'    => 'sometimes|integer|min:5|max:1440',
            'max_failed_attempts'        => 'sometimes|integer|min:3|max:10',
            'lockout_duration_minutes'   => 'sometimes|integer|min:5|max:120',
            'allow_multiple_devices'     => 'sometimes|boolean',
            'max_active_devices'         => 'sometimes|integer|min:1|max:20',
            'pos_require_shift_for_sale' => 'sometimes|boolean',
            'cashier_max_discount'       => 'sometimes|numeric|min:0|max:100',
            'supervisor_max_discount'    => 'sometimes|numeric|min:0|max:100',
            'manager_max_discount'       => 'sometimes|numeric|min:0|max:100',
            'require_manager_for_refund' => 'sometimes|boolean',
            'require_manager_for_void'   => 'sometimes|boolean',
            'audit_logging_enabled'      => 'sometimes|boolean',
        ]);

        foreach ($settings as $key => $value) {
            DB::table('security_settings')->updateOrInsert(
                ['company_id' => $companyId, 'key' => $key],
                ['value' => json_encode($value), 'updated_at' => now(), 'created_at' => now()]
            );
        }

        return $this->successResponse($settings, 'Security policies updated successfully');
    }

    /**
     * POST /api/v1/security/verify-manager-pin
     * Authenticate manager override for sensitive POS actions.
     */
    public function verifyManagerPin(Request $request): JsonResponse
    {
        $request->validate([
            'pin'              => 'required|string|min:4',
            'manager_username' => 'nullable|string',
            'action'           => 'required|string', // discount_override, price_override, void_sale, refund_sale
            'notes'            => 'nullable|string',
        ]);

        $currentUser = $request->user();
        $pin = $request->input('pin');
        $managerUsername = $request->input('manager_username');

        $manager = null;
        if ($managerUsername) {
            $manager = User::where('username', $managerUsername)
                ->orWhere('email', $managerUsername)
                ->first();
        } else {
            // Check if current user is manager/admin
            if ($currentUser->hasRole(['admin', 'manager', 'supervisor'])) {
                $manager = $currentUser;
            } else {
                // Find company manager or admin
                $manager = User::whereHas('roles', fn($q) => $q->whereIn('name', ['admin', 'manager']))
                    ->where('company_id', $currentUser->company_id)
                    ->first();
            }
        }

        if (!$manager) {
            return $this->errorResponse('Manager account not found.', null, 404);
        }

        $isValid = $manager->verifyManagerPin($pin);

        if (!$isValid) {
            return $this->errorResponse('Invalid Manager Security PIN.', null, 422);
        }

        // Record Audit Log for Manager Override
        if (class_exists(AuditLog::class)) {
            AuditLog::create([
                'company_id'     => $currentUser->company_id,
                'user_id'        => $currentUser->id,
                'event'          => 'MANAGER_OVERRIDE_' . strtoupper($request->action),
                'auditable_type' => 'ManagerApproval',
                'auditable_id'   => $manager->id,
                'new_values'     => [
                    'authorized_by' => $manager->name,
                    'cashier'       => $currentUser->name,
                    'action'        => $request->action,
                    'notes'         => $request->notes,
                    'description'   => "Manager {$manager->name} approved {$request->action} for {$currentUser->name}.",
                ],
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->userAgent(),
            ]);
        }

        return $this->successResponse([
            'verified'        => true,
            'manager_id'      => $manager->id,
            'manager_name'    => $manager->name,
            'approved_at'     => now()->toIso8601String(),
        ], 'Manager approval granted successfully');
    }

    /**
     * POST /api/v1/security/set-manager-pin
     */
    public function setManagerPin(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'pin'              => 'required|string|min:4|max:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Current password does not match.', null, 422);
        }

        $user->setManagerPin($request->pin);

        return $this->successResponse(null, 'Manager security PIN set successfully');
    }
}
