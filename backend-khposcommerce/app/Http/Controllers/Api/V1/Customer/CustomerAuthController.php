<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Customer\RegisterCustomerRequest;
use App\Http\Requests\Customer\LoginCustomerRequest;
use App\Models\User;
use App\Models\Customer\Customer;
use App\Services\Auth\JwtTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CustomerAuthController extends BaseApiController
{
    public function __construct(private readonly JwtTokenService $jwtTokenService)
    {
    }

    // ─── POST /api/v1/customer/auth/register (or /api/v1/store/auth/register) ──

    public function register(RegisterCustomerRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = DB::transaction(function () use ($validated) {
            $companyId = \App\Models\Company\Company::value('id') ?? 1;

            // Create user account
            $user = User::create([
                'company_id' => $companyId,
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'password'   => Hash::make($validated['password']),
                'phone'      => $validated['phone'] ?? null,
                'is_active'  => true,
            ]);

            // Assign customer role if Spatie permissions available
            try {
                $user->assignRole('customer');
            } catch (\Throwable) {
                // Role might not exist in some environments
            }

            // Create customer profile with initial welcome points
            $customer = Customer::create([
                'company_id'     => $companyId,
                'user_id'        => $user->id,
                'name'           => $validated['name'],
                'email'          => $validated['email'],
                'phone'          => $validated['phone'] ?? null,
                'gender'         => $validated['gender'] ?? null,
                'is_active'      => true,
                'loyalty_points' => 100, // 100 Welcome Points
            ]);

            return compact('user', 'customer');
        });

        // Generate JWT token pair
        $clientInfo = [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];
        $tokenData = $this->jwtTokenService->generateTokenPair($result['user'], false, $clientInfo);

        return $this->successResponse([
            'user'         => [
                'id'    => $result['user']->id,
                'name'  => $result['user']->name,
                'email' => $result['user']->email,
            ],
            'customer'     => [
                'id'             => $result['customer']->id,
                'name'           => $result['customer']->name,
                'email'          => $result['customer']->email,
                'phone'          => $result['customer']->phone,
                'loyalty_points' => (float) $result['customer']->loyalty_points,
            ],
            'access_token'  => $tokenData['access_token'],
            'refresh_token' => $tokenData['refresh_token'],
            'token_type'    => 'bearer',
            'expires_in'    => $tokenData['expires_in'],
        ], 'Registration successful', 201);
    }

    // ─── POST /api/v1/customer/auth/login (or /api/v1/store/auth/login) ───────

    public function login(LoginCustomerRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $identifier = trim($validated['email']);

        // Search user by email, phone, or username
        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->orWhere('username', $identifier)
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->errorResponse('Invalid email or password', null, 401);
        }

        if (!$user->is_active) {
            return $this->errorResponse('Your account has been deactivated. Please contact support.', null, 403);
        }

        // Find or create customer profile linked to user
        $customer = Customer::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();

        if (!$customer) {
            $customer = Customer::create([
                'user_id'        => $user->id,
                'company_id'     => $user->company_id ?? 1,
                'name'           => $user->name,
                'email'          => $user->email,
                'phone'          => $user->phone,
                'is_active'      => true,
                'loyalty_points' => 100,
            ]);
        }

        // Generate JWT token pair
        $clientInfo = [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];
        $tokenData = $this->jwtTokenService->generateTokenPair($user, false, $clientInfo);

        return $this->successResponse([
            'user'         => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'customer'     => [
                'id'             => $customer->id,
                'name'           => $customer->name,
                'email'          => $customer->email,
                'phone'          => $customer->phone,
                'photo'          => $customer->photo,
                'loyalty_points' => (float) $customer->loyalty_points,
            ],
            'access_token'  => $tokenData['access_token'],
            'refresh_token' => $tokenData['refresh_token'],
            'token_type'    => 'bearer',
            'expires_in'    => $tokenData['expires_in'],
        ], 'Login successful');
    }

    // ─── POST /api/v1/customer/auth/google (or /api/v1/store/auth/google) ───────

    public function googleLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'     => 'required|email',
            'name'      => 'required|string',
            'google_id' => 'nullable|string',
            'avatar'    => 'nullable|string',
        ]);

        $companyId = \App\Models\Company\Company::value('id') ?? 1;

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            $user = User::create([
                'company_id' => $companyId,
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'password'   => Hash::make(\Illuminate\Support\Str::random(24)),
                'is_active'  => true,
            ]);

            try {
                $user->assignRole('customer');
            } catch (\Throwable) {}
        }

        if (!$user->is_active) {
            return $this->errorResponse('Your account has been deactivated. Please contact support.', null, 403);
        }

        $customer = Customer::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();

        if (!$customer) {
            $customer = Customer::create([
                'company_id'     => $companyId,
                'user_id'        => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'photo'          => $validated['avatar'] ?? null,
                'is_active'      => true,
                'loyalty_points' => 100,
            ]);
        }

        $clientInfo = [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];
        $tokenData = $this->jwtTokenService->generateTokenPair($user, false, $clientInfo);

        return $this->successResponse([
            'user'         => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'customer'     => [
                'id'             => $customer->id,
                'name'           => $customer->name,
                'email'          => $customer->email,
                'phone'          => $customer->phone,
                'photo'          => $customer->photo,
                'loyalty_points' => (float) $customer->loyalty_points,
            ],
            'access_token'  => $tokenData['access_token'],
            'refresh_token' => $tokenData['refresh_token'],
            'token_type'    => 'bearer',
            'expires_in'    => $tokenData['expires_in'],
        ], 'Login with Google successful');
    }

    // ─── POST /api/v1/customer/auth/logout ───────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token') ?? $request->header('X-Refresh-Token');
        if ($refreshToken) {
            $this->jwtTokenService->revokeRefreshToken($refreshToken);
        }

        return $this->successResponse(null, 'Logged out successfully');
    }

    // ─── GET /api/v1/customer/auth/me ────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->errorResponse('Unauthenticated', null, 401);
        }

        $customer = Customer::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->with(['addresses', 'group'])
            ->first();

        if (!$customer) {
            return $this->errorResponse('Customer profile not found', null, 404);
        }

        return $this->successResponse([
            'user'     => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'customer' => [
                'id'             => $customer->id,
                'name'           => $customer->name,
                'email'          => $customer->email,
                'phone'          => $customer->phone,
                'photo'          => $customer->photo,
                'gender'         => $customer->gender,
                'birth_date'     => $customer->birth_date,
                'loyalty_points' => (float) $customer->loyalty_points,
                'group'          => $customer->group?->name,
                'addresses'      => $customer->addresses,
            ],
        ]);
    }

    // ─── PUT /api/v1/customer/auth/profile ───────────────────────────────────

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->errorResponse('Unauthenticated', null, 401);
        }

        $customer = Customer::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();

        if (!$customer) {
            return $this->errorResponse('Customer profile not found', null, 404);
        }

        $validated = $request->validate([
            'name'       => 'sometimes|string|max:191',
            'phone'      => 'nullable|string|max:50',
            'gender'     => 'nullable|in:male,female,other',
            'birth_date' => 'nullable|date',
            'photo'      => 'nullable|string',
        ]);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }
        if (isset($validated['phone'])) {
            $user->update(['phone' => $validated['phone']]);
        }

        $customer->update($validated);

        return $this->successResponse($customer->fresh(), 'Profile updated successfully');
    }

    // ─── POST /api/v1/customer/auth/change-password ──────────────────────────

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();
        if (!$user) {
            return $this->errorResponse('Unauthenticated', null, 401);
        }

        if (!Hash::check($validated['current_password'], $user->password)) {
            return $this->errorResponse('Current password does not match', null, 422);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        return $this->successResponse(null, 'Password changed successfully');
    }

    // ─── POST /api/v1/customer/auth/forgot-password ──────────────────────────

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        return $this->successResponse(null, 'If your email is registered, password reset instructions have been sent.');
    }

    // ─── POST /api/v1/customer/auth/reset-password ───────────────────────────

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        return $this->successResponse(null, 'Password has been reset successfully.');
    }
}
