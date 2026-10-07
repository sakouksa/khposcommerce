<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\AuthService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class MobileAuthController extends BaseApiController
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    /**
     * POST /api/v1/mobile/auth/login
     * Mobile cashier/staff authentication via credentials
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $clientInfo = [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device'     => $request->header('X-Device-Name', 'Mobile-POS-Device'),
            'browser'    => 'Mobile App',
            'os'         => $request->header('X-OS-Name', 'Android/iOS'),
            'country'    => 'KH',
        ];

        $result = $this->authService->login(
            $request->username,
            $request->password,
            true, // Remember session on mobile
            $clientInfo
        );

        if (!$result['success']) {
            return $this->errorResponse($result['message'], null, $result['code'] ?? 401);
        }

        $user = $result['user']->load(['roles', 'permissions', 'company', 'branch', 'employee']);

        return $this->successResponse([
            'user'          => new UserResource($user),
            'roles'         => $user->getRoleNames()->toArray(),
            'permissions'   => $user->getAllPermissions()->pluck('name')->toArray(),
            'company'       => $user->company ? [
                'id'            => $user->company->id,
                'name'          => $user->company->name,
                'currency_code' => $user->company->currency_code ?? 'USD',
                'currency_symbol' => '$',
                'phone'         => $user->company->phone,
            ] : null,
            'branch'        => $user->branch ? [
                'id'            => $user->branch->id,
                'name'          => $user->branch->name,
                'code'          => $user->branch->code,
                'phone'         => $user->branch->phone,
                'address'       => $user->branch->address,
            ] : null,
            'access_token'  => $result['access_token'],
            'token_type'    => 'Bearer',
            'expires_in'    => $result['expires_in'],
        ], 'Mobile login successful');
    }

    /**
     * POST /api/v1/mobile/auth/pin-login
     * Quick 4-6 digit cashier PIN switch for fast counter operation
     */
    public function pinLogin(Request $request): JsonResponse
    {
        $request->validate([
            'pin'       => 'required|string|min:4|max:8',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $pin = $request->input('pin');
        $branchId = $request->input('branch_id');

        // Look for active user with matching PIN within the branch or company
        $query = User::where('is_active', true);
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $users = $query->get();
        $matchedUser = null;

        foreach ($users as $user) {
            // Check pin column or password fallback if pin is set
            if (!empty($user->pin) && Hash::check($pin, $user->pin)) {
                $matchedUser = $user;
                break;
            }
        }

        if (!$matchedUser) {
            return $this->errorResponse('Invalid PIN code or unauthorized counter user', null, 401);
        }

        $token = JWTAuth::fromUser($matchedUser);

        return $this->successResponse([
            'user'         => new UserResource($matchedUser->load(['company', 'branch'])),
            'roles'        => $matchedUser->getRoleNames()->toArray(),
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => config('jwt.ttl', 60) * 60,
        ], 'Cashier switched successfully');
    }

    /**
     * POST /api/v1/mobile/auth/refresh
     */
    public function refresh(): JsonResponse
    {
        try {
            $newToken = JWTAuth::parseToken()->refresh();
            return $this->successResponse([
                'access_token' => $newToken,
                'token_type'   => 'Bearer',
                'expires_in'   => config('jwt.ttl', 60) * 60,
            ], 'Token refreshed successfully');
        } catch (\Throwable $e) {
            return $this->errorResponse('Could not refresh mobile token', null, 401);
        }
    }

    /**
     * GET /api/v1/mobile/auth/profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['company', 'branch', 'employee', 'roles', 'permissions']);

        return $this->successResponse([
            'user'        => new UserResource($user),
            'roles'       => $user->getRoleNames()->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            'branch'      => $user->branch,
            'company'     => $user->company,
        ], 'Profile retrieved');
    }

    /**
     * PUT /api/v1/mobile/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($data);

        return $this->successResponse(new UserResource($user), 'Profile updated successfully');
    }

    /**
     * POST /api/v1/mobile/auth/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Current password does not match', null, 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return $this->successResponse(null, 'Password changed successfully');
    }

    /**
     * POST /api/v1/mobile/auth/logout
     */
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::parseToken()->invalidate();
        } catch (\Throwable) {
            // Already expired or invalid
        }

        return $this->successResponse(null, 'Mobile session logged out successfully');
    }
}
