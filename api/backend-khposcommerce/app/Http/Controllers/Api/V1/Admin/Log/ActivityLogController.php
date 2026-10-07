<?php

namespace App\Http\Controllers\Api\V1\Admin\Log;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Activity::with('causer', 'subject')
            ->when($request->filled('search'), fn($q) =>
                $q->where('description', 'like', "%{$request->search}%")
            )
            ->when($request->filled('causer_type'), fn($q) =>
                $q->where('causer_type', $request->causer_type)
            )
            ->when($request->filled('log_name'), fn($q) =>
                $q->where('log_name', $request->log_name)
            )
            ->when($request->filled('date_from'), fn($q) =>
                $q->whereDate('created_at', '>=', $request->date_from)
            )
            ->when($request->filled('date_to'), fn($q) =>
                $q->whereDate('created_at', '<=', $request->date_to)
            )
            ->latest();

        $logs = $query->paginate($request->get('per_page', 20));

        return $this->paginatedResponse($logs);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(Activity::with('causer', 'subject')->findOrFail($id));
    }

    public function dashboard(): JsonResponse
    {
        $totalActivities = Activity::count();
        $todayActivities = Activity::whereDate('created_at', now()->today())->count();
        $failedActions = Activity::where(function ($q) {
            $q->where('description', 'like', '%fail%')
              ->orWhere('description', 'like', '%error%')
              ->orWhere('description', 'like', '%denied%');
        })->count();
        $successActions = max(0, $totalActivities - $failedActions);

        $activeUsers = Activity::whereNotNull('causer_id')->distinct('causer_id')->count('causer_id');
        $averageActionsPerUser = $activeUsers > 0 ? round($totalActivities / $activeUsers, 1) : 0;
        $loginSessions = Activity::where('description', 'like', '%login%')->count();

        $loginAttempts = max($loginSessions, Activity::where('description', 'like', '%login%')->orWhere('description', 'like', '%auth%')->count());
        $failedLogin = Activity::where('description', 'like', '%login%')
            ->where(function ($q) {
                $q->where('description', 'like', '%fail%')
                  ->orWhere('description', 'like', '%invalid%');
            })->count();
        $securityAlerts = Activity::where(function ($q) {
            $q->where('description', 'like', '%unauthorized%')
              ->orWhere('description', 'like', '%permission%')
              ->orWhere('description', 'like', '%blocked%')
              ->orWhere('description', 'like', '%delete%');
        })->count();

        $apiActions = Activity::whereNotNull('log_name')->count();
        $databaseChanges = Activity::whereIn('event', ['created', 'updated', 'deleted'])
            ->orWhere('description', 'like', '%create%')
            ->orWhere('description', 'like', '%update%')
            ->orWhere('description', 'like', '%delete%')
            ->count();
        $fileOperations = Activity::where('description', 'like', '%export%')
            ->orWhere('description', 'like', '%import%')
            ->orWhere('description', 'like', '%file%')
            ->count();
        $averageResponseTime = 42;

        // Mini KPI metrics
        $todayLogin = Activity::whereDate('created_at', now()->today())
            ->where('description', 'like', '%login%')
            ->count();
        $newUsers = Activity::where('event', 'created')
            ->where('subject_type', 'like', '%User%')
            ->count();
        $passwordChanges = Activity::where('description', 'like', '%password%')->count();
        $permissionChanges = Activity::where('description', 'like', '%permission%')
            ->orWhere('description', 'like', '%role%')
            ->count();
        $dataExport = Activity::where('description', 'like', '%export%')->count();
        $dataImport = Activity::where('description', 'like', '%import%')->count();

        return $this->successResponse([
            'totalActivities' => $totalActivities,
            'successActions' => $successActions,
            'failedActions' => $failedActions,
            'todayActivities' => $todayActivities,

            'activeUsers' => $activeUsers,
            'averageActionsPerUser' => $averageActionsPerUser,
            'loginSessions' => $loginSessions,

            'loginAttempts' => $loginAttempts,
            'failedLogin' => $failedLogin,
            'securityAlerts' => $securityAlerts,

            'apiActions' => $apiActions,
            'databaseChanges' => $databaseChanges,
            'fileOperations' => $fileOperations,
            'averageResponseTime' => $averageResponseTime,

            'todayLogin' => $todayLogin,
            'newUsers' => $newUsers,
            'passwordChanges' => $passwordChanges,
            'permissionChanges' => $permissionChanges,
            'dataExport' => $dataExport,
            'dataImport' => $dataImport,
        ]);
    }
}
