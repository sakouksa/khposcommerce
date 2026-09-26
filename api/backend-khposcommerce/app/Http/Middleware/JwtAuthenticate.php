<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\Auth\JwtTokenService;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticate
{
    public function __construct(private readonly JwtTokenService $jwtTokenService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
                'error'   => 'UNAUTHENTICATED',
            ], 401);
        }

        $token = substr($header, 7);
        $payload = $this->jwtTokenService->decodeAccessToken($token);

        if (!$payload) {
            return response()->json([
                'success' => false,
                'message' => 'Your session has expired. Please sign in again.',
                'error'   => 'TOKEN_EXPIRED',
            ], 401);
        }

        $userId = $payload->sub ?? null;
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed.',
                'error'   => 'INVALID_TOKEN',
            ], 401);
        }

        $user = User::with(['roles', 'permissions', 'company', 'branch', 'employee'])->find($userId);

        if (!$user || !$user->is_active || $user->isLocked() || $user->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is no longer active or is locked.',
                'error'   => 'ACCOUNT_DISABLED',
            ], 401);
        }

        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
