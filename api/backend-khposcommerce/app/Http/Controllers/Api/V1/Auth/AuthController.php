<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends BaseApiController
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $clientInfo = [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device'     => $request->header('X-Device-Name', 'Browser'),
            'browser'    => $request->header('X-Browser-Name', 'Web Browser'),
            'os'         => $request->header('X-OS-Name', 'Unknown OS'),
            'country'    => $request->header('X-Country-Code', 'Internal'),
        ];

        $result = $this->authService->login(
            $request->username,
            $request->password,
            $request->remember ?? false,
            $clientInfo
        );

        if (!$result['success']) {
            return $this->errorResponse($result['message'], null, $result['code'] ?? 401);
        }

        $user = $result['user']->load(['roles', 'permissions', 'company', 'branch', 'employee']);

        $roles = $user->getRoleNames()->toArray();
        $permissions = $user->getAllPermissions()->pluck('name')->toArray();

        return $this->successResponse([
            'user'          => new UserResource($user),
            'roles'         => $roles,
            'permissions'   => $permissions,
            'company'       => $user->company,
            'branch'        => $user->branch,
            'profile'       => new UserResource($user),
            'menus'         => $this->getAvailableMenus($roles, $permissions),
            'access_token'  => $result['access_token'],
            'token'         => $result['access_token'],
            'refresh_token' => $result['refresh_token'],
            'token_expire'  => $result['expires_in'],
            'expires_in'    => $result['expires_in'],
        ], 'Login successful');
    }

    /**
     * POST /api/v1/auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token') ?? $request->header('X-Refresh-Token');

        if (!$refreshToken) {
            return $this->errorResponse('Token Missing', null, 401);
        }

        $clientInfo = [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device'     => $request->header('X-Device-Name', 'Browser'),
            'browser'    => $request->header('X-Browser-Name', 'Web Browser'),
            'os'         => $request->header('X-OS-Name', 'Unknown OS'),
            'country'    => $request->header('X-Country-Code', 'Internal'),
        ];

        $result = $this->authService->refreshToken($refreshToken, $clientInfo);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], null, $result['code'] ?? 401);
        }

        $user = $result['user']->load(['roles', 'permissions', 'company', 'branch', 'employee']);

        return $this->successResponse([
            'user'          => new UserResource($user),
            'roles'         => $user->getRoleNames()->toArray(),
            'permissions'   => $user->getAllPermissions()->pluck('name')->toArray(),
            'company'       => $user->company,
            'branch'        => $user->branch,
            'access_token'  => $result['access_token'],
            'token'         => $result['access_token'],
            'refresh_token' => $result['refresh_token'],
            'token_expire'  => $result['expires_in'],
            'expires_in'    => $result['expires_in'],
        ], 'Token refreshed');
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token') ?? $request->header('X-Refresh-Token');

        if ($refreshToken) {
            $this->authService->logout($refreshToken);
        }

        return $this->successResponse(null, 'Logged out successfully');
    }

    /**
     * POST /api/v1/auth/logout-all-devices
     */
    public function logoutAllDevices(Request $request): JsonResponse
    {
        $this->authService->logoutAllDevices($request->user()->id);

        return $this->successResponse(null, 'Logged out from all devices');
    }

    /**
     * GET /api/v1/auth/profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'permissions', 'company', 'branch', 'employee']);

        return $this->successResponse([
            'user'        => new UserResource($user),
            'roles'       => $user->getRoleNames()->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            'company'     => $user->company,
            'branch'      => $user->branch,
        ]);
    }

    /**
     * PUT /api/v1/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string|max:20',
        ]);

        $user->update($request->only(['name', 'email', 'phone']));

        return $this->successResponse(new UserResource($user), 'Profile updated successfully');
    }

    /**
     * POST /api/v1/auth/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $result = $this->authService->changePassword(
            $request->user(),
            $request->current_password,
            $request->password
        );

        if (!$result) {
            return $this->errorResponse('Current password is incorrect', null, 422);
        }

        return $this->successResponse(null, 'Password changed successfully');
    }

    /**
     * POST /api/v1/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $identifier = $request->input('identifier') ?? $request->input('email') ?? $request->input('username');

        $result = $this->authService->requestPasswordReset((string) $identifier);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], null, $result['code'] ?? 400);
        }

        return $this->successResponse($result, $result['message']);
    }

    /**
     * POST /api/v1/auth/reset-password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $identifier  = $request->input('identifier') ?? $request->input('username') ?? $request->input('email');
        $resetToken  = $request->input('reset_token') ?? $request->input('otp_code') ?? $request->input('token');
        $newPassword = $request->input('password') ?? $request->input('new_password');

        $result = $this->authService->resetPasswordWithToken((string) $identifier, (string) $resetToken, (string) $newPassword);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], null, $result['code'] ?? 400);
        }

        return $this->successResponse($result, $result['message']);
    }

    private function getAvailableMenus(array $roles, array $permissions): array
    {
        $allMenus = [
            ['key' => 'dashboard', 'title' => 'Dashboard', 'path' => '/dashboard', 'permission' => null],
            ['key' => 'products', 'title' => 'Products', 'path' => '/products', 'permission' => 'products.view'],
            ['key' => 'categories', 'title' => 'Categories', 'path' => '/categories', 'permission' => 'categories.view'],
            ['key' => 'inventory', 'title' => 'Inventory', 'path' => '/inventory', 'permission' => 'inventory.view'],
            ['key' => 'pos', 'title' => 'POS', 'path' => '/pos', 'permission' => 'pos.access'],
            ['key' => 'sales', 'title' => 'Sales', 'path' => '/sales', 'permission' => 'sales.view'],
            ['key' => 'orders', 'title' => 'Orders', 'path' => '/orders', 'permission' => 'orders.view'],
            ['key' => 'purchases', 'title' => 'Purchases', 'path' => '/purchases', 'permission' => 'purchases.view'],
            ['key' => 'suppliers', 'title' => 'Suppliers', 'path' => '/suppliers', 'permission' => 'suppliers.view'],
            ['key' => 'customers', 'title' => 'Customers', 'path' => '/customers', 'permission' => 'customers.view'],
            ['key' => 'employees', 'title' => 'Employees', 'path' => '/employees', 'permission' => 'employees.view'],
            ['key' => 'reports', 'title' => 'Reports', 'path' => '/reports', 'permission' => 'reports.view'],
            ['key' => 'users', 'title' => 'Users', 'path' => '/users', 'permission' => 'users.view'],
            ['key' => 'roles', 'title' => 'Roles', 'path' => '/roles', 'permission' => 'roles.view'],
            ['key' => 'settings', 'title' => 'Settings', 'path' => '/settings', 'permission' => 'settings.view'],
        ];

        if (in_array('super_admin', $roles) || in_array('admin', $roles)) {
            return $allMenus;
        }

        return array_values(array_filter($allMenus, function ($item) use ($permissions) {
            return $item['permission'] === null || in_array($item['permission'], $permissions);
        }));
    }
}
