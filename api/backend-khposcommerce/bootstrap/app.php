<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.jwt' => \App\Http\Middleware\JwtAuthenticate::class,
        ]);
        $middleware->api(prepend: [
            \App\Http\Middleware\LocalizationMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                if ($e instanceof AuthenticationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Please login.',
                        'error'   => 'UNAUTHENTICATED',
                    ], 401);
                }

                if ($e instanceof ValidationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed.',
                        'errors'  => $e->errors(),
                    ], 422);
                }

                if ($e instanceof AccessDeniedHttpException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission.',
                        'error'   => 'FORBIDDEN',
                    ], 403);
                }

                if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Requested resource not found.',
                        'error'   => 'NOT_FOUND',
                    ], 404);
                }

                if ($e instanceof TooManyRequestsHttpException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many requests. Please wait before trying again.',
                        'error'   => 'TOO_MANY_REQUESTS',
                    ], 429);
                }

                if ($e instanceof HttpException) {
                    $statusCode = $e->getStatusCode();
                    if ($statusCode === 503) {
                        return response()->json([
                            'success' => false,
                            'message' => 'The system is currently under maintenance.',
                            'error'   => 'MAINTENANCE_MODE',
                        ], 503);
                    }
                    return response()->json([
                        'success' => false,
                        'message' => $e->getMessage() ?: 'Server error.',
                        'error'   => 'HTTP_ERROR',
                    ], $statusCode);
                }

                // Default catch-all for 500 server errors - NEVER expose SQL or raw stack trace
                return response()->json([
                    'success' => false,
                    'message' => 'Unexpected server error.',
                    'error'   => 'INTERNAL_SERVER_ERROR',
                ], 500);
            }
        });
    })->create();
