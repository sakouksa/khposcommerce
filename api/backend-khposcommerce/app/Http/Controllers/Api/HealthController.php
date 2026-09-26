<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Throwable;

class HealthController extends Controller
{
    /**
     * Perform comprehensive system health checks.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function check(Request $request): JsonResponse
    {
        $startTime = microtime(true);
        $checks = [];
        $isHealthy = true;

        // 1. Check Database (PostgreSQL)
        try {
            $dbStart = microtime(true);
            DB::select('SELECT 1');
            $dbDuration = round((microtime(true) - $dbStart) * 1000, 2);
            $checks['database'] = [
                'status' => 'UP',
                'driver' => config('database.default'),
                'latency_ms' => $dbDuration,
            ];
        } catch (Throwable $e) {
            $isHealthy = false;
            $checks['database'] = [
                'status' => 'DOWN',
                'error' => 'Database connection failed: ' . $e->getMessage(),
            ];
        }

        // 2. Check Redis / Cache
        try {
            $cacheStart = microtime(true);
            $cacheKey = 'health_check_' . time();
            Cache::put($cacheKey, 'ok', 10);
            $cachedVal = Cache::get($cacheKey);
            Cache::forget($cacheKey);

            $cacheDuration = round((microtime(true) - $cacheStart) * 1000, 2);
            $checks['cache'] = [
                'status' => $cachedVal === 'ok' ? 'UP' : 'DOWN',
                'driver' => config('cache.default'),
                'latency_ms' => $cacheDuration,
            ];
        } catch (Throwable $e) {
            $isHealthy = false;
            $checks['cache'] = [
                'status' => 'DOWN',
                'error' => 'Cache connection failed: ' . $e->getMessage(),
            ];
        }

        // 3. Check File Storage
        try {
            $disk = config('filesystems.default', 'local');
            $storageStart = microtime(true);
            $testFile = 'health_check.tmp';
            Storage::disk($disk)->put($testFile, 'health-check');
            Storage::disk($disk)->delete($testFile);
            $storageDuration = round((microtime(true) - $storageStart) * 1000, 2);

            $checks['storage'] = [
                'status' => 'UP',
                'disk' => $disk,
                'latency_ms' => $storageDuration,
            ];
        } catch (Throwable $e) {
            $isHealthy = false;
            $checks['storage'] = [
                'status' => 'DOWN',
                'error' => 'Storage disk write failed',
            ];
        }

        // 4. Memory & Environment Check
        $checks['system'] = [
            'php_version' => PHP_VERSION,
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB',
        ];

        $totalDuration = round((microtime(true) - $startTime) * 1000, 2);

        $payload = [
            'status' => $isHealthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'response_time_ms' => $totalDuration,
            'checks' => $checks,
        ];

        return response()->json($payload, $isHealthy ? 200 : 503);
    }
}
