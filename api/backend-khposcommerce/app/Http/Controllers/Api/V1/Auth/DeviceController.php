<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Auth\JwtRefreshToken;
use App\Models\Log\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends BaseApiController
{
    /**
     * GET /api/v1/devices
     * List all registered devices / active sessions for the current user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentDeviceId = $request->header('X-Device-Id');

        $query = JwtRefreshToken::with('user:id,name,username,email')
            ->where('user_id', $user->id);

        // If admin requested all user devices
        if ($user->hasRole('admin') && $request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $devices = $query->latest('last_active_at')
            ->paginate($request->integer('per_page', 20));

        $items = collect($devices->items())->map(function (JwtRefreshToken $token) use ($currentDeviceId) {
            return [
                'id'                => $token->id,
                'device_id'         => $token->device_id,
                'device_name'       => $token->device_name ?: ($token->device ?: 'Unknown Device'),
                'device_type'       => $token->device_type ?: 'web',
                'browser'           => $token->browser,
                'os'                => $token->os,
                'platform'          => $token->platform ?: $token->os,
                'app_version'       => $token->app_version,
                'ip_address'        => $token->ip_address,
                'status'            => $token->status ?: ($token->revoked ? 'revoked' : ($token->expires_at->isPast() ? 'expired' : 'active')),
                'is_current_device' => $currentDeviceId && $token->device_id === $currentDeviceId,
                'last_active_at'    => $token->last_active_at ? $token->last_active_at->toIso8601String() : $token->created_at->toIso8601String(),
                'created_at'        => $token->created_at->toIso8601String(),
                'expires_at'        => $token->expires_at->toIso8601String(),
                'revoked_at'        => $token->revoked_at?->toIso8601String(),
                'user'              => [
                    'id'       => $token->user?->id,
                    'name'     => $token->user?->name,
                    'username' => $token->user?->username,
                    'email'    => $token->user?->email,
                ],
            ];
        });

        return response()->json([
            'success'    => true,
            'message'    => 'Devices retrieved successfully',
            'data'       => $items,
            'pagination' => [
                'total'        => $devices->total(),
                'per_page'     => $devices->perPage(),
                'current_page' => $devices->currentPage(),
                'last_page'    => $devices->lastPage(),
                'from'         => $devices->firstItem(),
                'to'           => $devices->lastItem(),
            ],
            'meta' => [
                'active_count'  => JwtRefreshToken::where('user_id', $user->id)->active()->count(),
                'total_devices' => JwtRefreshToken::where('user_id', $user->id)->count(),
            ]
        ]);
    }

    /**
     * POST /api/v1/devices/{id}/revoke
     * Revoke a single device session.
     */
    public function revoke(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $device = JwtRefreshToken::where('id', $id)
            ->when(!$user->hasRole('admin'), fn($q) => $q->where('user_id', $user->id))
            ->firstOrFail();

        $device->revoke($user->id);

        // Record Audit Log
        if (class_exists(AuditLog::class)) {
            AuditLog::create([
                'company_id'     => $user->company_id,
                'user_id'        => $user->id,
                'event'          => 'DEVICE_REVOKED',
                'auditable_type' => 'JwtRefreshToken',
                'auditable_id'   => $device->id,
                'old_values'     => ['status' => 'active'],
                'new_values'     => [
                    'status'      => 'revoked',
                    'revoked_by'  => $user->id,
                    'description' => "Device '{$device->device_name}' ({$device->ip_address}) was revoked.",
                ],
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->userAgent(),
            ]);
        }

        return $this->successResponse(null, 'Device session revoked successfully');
    }

    /**
     * POST /api/v1/devices/revoke-others
     * Sign out all other sessions/devices except the current device.
     */
    public function revokeOthers(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentDeviceId = $request->header('X-Device-Id');

        $currentToken = null;
        if ($currentDeviceId) {
            $currentToken = JwtRefreshToken::where('user_id', $user->id)
                ->where('device_id', $currentDeviceId)
                ->where('revoked', false)
                ->latest()
                ->first();
        }

        $query = JwtRefreshToken::where('user_id', $user->id)
            ->where('revoked', false);

        if ($currentToken) {
            $query->where('id', '!=', $currentToken->id);
        }

        $revokedCount = $query->count();

        $query->update([
            'revoked'    => true,
            'status'     => 'revoked',
            'revoked_at' => now(),
            'revoked_by' => $user->id,
        ]);

        // Record Audit Log
        if (class_exists(AuditLog::class)) {
            AuditLog::create([
                'company_id'     => $user->company_id,
                'user_id'        => $user->id,
                'event'          => 'ALL_OTHER_DEVICES_REVOKED',
                'auditable_type' => 'User',
                'auditable_id'   => $user->id,
                'new_values'     => [
                    'revoked_count' => $revokedCount,
                    'description'   => "User signed out {$revokedCount} other device sessions.",
                ],
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->userAgent(),
            ]);
        }

        return $this->successResponse([
            'revoked_count' => $revokedCount,
        ], "Signed out {$revokedCount} other device(s) successfully");
    }

    /**
     * POST /api/v1/devices/{id}/suspicious
     * Flag device as suspicious.
     */
    public function markSuspicious(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $device = JwtRefreshToken::where('id', $id)
            ->when(!$user->hasRole('admin'), fn($q) => $q->where('user_id', $user->id))
            ->firstOrFail();

        $device->markSuspicious();

        return $this->successResponse(null, 'Device marked as suspicious');
    }
}
