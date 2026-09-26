<?php

namespace App\Http\Controllers\Api\V1\Admin\Notification;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Notification\NotificationService;
use App\Http\Requests\Notification\StoreNotificationRequest;
use App\Http\Requests\Notification\UpdateNotificationRequest;
use App\Http\Resources\Notification\NotificationResource;
use App\Http\Resources\Notification\NotificationLogResource;
use App\Models\Notification\Notification;
use App\Models\Notification\NotificationUser;
use App\Models\Notification\NotificationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class NotificationController extends BaseApiController
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * GET /api/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only([
            'search', 'type', 'priority', 'status', 'tab',
            'start_date', 'end_date', 'company_id', 'branch_id', 'include_archived',
            'created_by', 'is_global'
        ]);
        $perPage = (int) $request->get('per_page', 15);

        $paginated = $this->notificationService->getNotificationsForUser($user, $filters, $perPage);
        $collection = NotificationResource::collection($paginated);

        return $this->successResponse($collection, 'Notifications retrieved successfully');
    }

    /**
     * GET /api/notifications/stats
     * Returns 12 summary card metrics + 4 chart datasets
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $baseQuery = Notification::query();
        if ($user->company_id && !$user->hasRole('Super Admin')) {
            $baseQuery->forCompany($user->company_id);
        }

        $totalCount = (clone $baseQuery)->count();
        $todayCount = (clone $baseQuery)->whereDate('created_at', Carbon::today())->count();
        $criticalCount = (clone $baseQuery)->where('priority', 'critical')->count();
        $systemCount = (clone $baseQuery)->where('type', 'system')->count();
        $inventoryCount = (clone $baseQuery)->where('type', 'inventory')->count();
        $salesCount = (clone $baseQuery)->where('type', 'sales')->count();
        $purchaseCount = (clone $baseQuery)->where('type', 'purchase')->count();
        $financeCount = (clone $baseQuery)->whereIn('type', ['finance', 'expense', 'payment'])->count();
        $employeeCount = (clone $baseQuery)->whereIn('type', ['employee', 'attendance', 'payroll'])->count();
        $securityCount = (clone $baseQuery)->where('type', 'security')->count();

        // User unread/read breakdown
        $unreadCount = NotificationUser::where('user_id', $user->id)->where('is_read', false)->where('is_archived', false)->count();
        $readCount = NotificationUser::where('user_id', $user->id)->where('is_read', true)->count();

        // Charts datasets
        // 1. By Type
        $byType = (clone $baseQuery)
            ->select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->pluck('count', 'type');

        // 2. By Priority
        $byPriority = (clone $baseQuery)
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority');

        // 3. 7-Day Trend (Single Query Optimization)
        $sevenDaysAgo = Carbon::today()->subDays(6)->startOfDay();
        $rawTrend = (clone $baseQuery)
            ->where('created_at', '>=', $sevenDaysAgo)
            ->select(DB::raw('DATE(created_at) as date_val'), DB::raw('count(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->pluck('count', 'date_val');

        $dailyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $carbonDate = Carbon::today()->subDays($i);
            $dateKey = $carbonDate->format('Y-m-d');
            $dailyTrend[] = [
                'date' => $carbonDate->format('M d'),
                'count' => (int) ($rawTrend[$dateKey] ?? 0),
            ];
        }

        return $this->successResponse([
            'summary' => [
                'total' => $totalCount,
                'unread' => $unreadCount,
                'read' => $readCount,
                'critical' => $criticalCount,
                'system' => $systemCount,
                'inventory' => $inventoryCount,
                'sales' => $salesCount,
                'purchase' => $purchaseCount,
                'finance' => $financeCount,
                'employee' => $employeeCount,
                'security' => $securityCount,
                'today' => $todayCount,
            ],
            'charts' => [
                'by_type' => $byType,
                'by_priority' => $byPriority,
                'daily_trend' => $dailyTrend,
                'read_ratio' => [
                    'read' => $readCount,
                    'unread' => $unreadCount,
                ],
            ],
        ], 'Notification statistics retrieved successfully');
    }

    /**
     * GET /api/notifications/unread
     */
    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = (int) $request->get('limit', 10);
        $result = $this->notificationService->getUnreadForUser($user, $limit);

        return response()->json([
            'success' => true,
            'message' => 'Unread notifications retrieved successfully',
            'unread_count' => $result['unread_count'],
            'data' => NotificationResource::collection($result['notifications']),
        ]);
    }

    /**
     * GET /api/notifications/{id}
     */
    public function show($id): JsonResponse
    {
        $notification = Notification::with(['company', 'branch', 'creator', 'notificationUsers', 'logs'])->findOrFail($id);
        $this->authorize('view', $notification);

        return $this->successResponse(new NotificationResource($notification), 'Notification retrieved successfully');
    }

    /**
     * GET /api/notifications/{id}/logs
     * Returns full delivery logs & read users timeline
     */
    public function logs($id): JsonResponse
    {
        $notification = Notification::with(['logs.user', 'notificationUsers.user'])->findOrFail($id);
        $this->authorize('view', $notification);

        $readUsers = $notification->notificationUsers->map(function ($nu) {
            return [
                'user_id' => $nu->user_id,
                'name' => $nu->user ? $nu->user->name : 'User #' . $nu->user_id,
                'email' => $nu->user ? $nu->user->email : null,
                'is_read' => $nu->is_read,
                'read_at' => $nu->read_at ? $nu->read_at->toIso8601String() : null,
            ];
        });

        return $this->successResponse([
            'logs' => NotificationLogResource::collection($notification->logs),
            'read_users' => $readUsers,
            'recipient_count' => $notification->notificationUsers->count(),
            'read_count' => $notification->notificationUsers->where('is_read', true)->count(),
        ], 'Notification logs retrieved successfully');
    }

    /**
     * POST /api/notifications/{id}/duplicate
     */
    public function duplicate(Request $request, $id): JsonResponse
    {
        $this->authorize('create', Notification::class);
        $original = Notification::findOrFail($id);

        $cloned = $original->replicate(['created_at', 'updated_at']);
        $cloned->title = $original->title . ' (Copy)';
        $cloned->created_by = $request->user()->id;
        $cloned->save();

        // Copy pivot users
        $userIds = $original->notificationUsers()->pluck('user_id')->toArray();
        if (!empty($userIds)) {
            $now = Carbon::now();
            $pivotData = [];
            foreach ($userIds as $uid) {
                $pivotData[] = [
                    'notification_id' => $cloned->id,
                    'user_id' => $uid,
                    'is_read' => false,
                    'is_archived' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            NotificationUser::insertOrIgnore($pivotData);
        }

        return $this->successResponse(new NotificationResource($cloned), 'Notification duplicated successfully', 201);
    }

    /**
     * POST /api/notifications
     */
    public function store(StoreNotificationRequest $request): JsonResponse
    {
        $this->authorize('create', Notification::class);

        $notification = $this->notificationService->sendNotification($request->validated());
        return $this->successResponse(new NotificationResource($notification), 'Notification sent successfully', 201);
    }

    /**
     * PUT /api/notifications/{id}
     */
    public function update(UpdateNotificationRequest $request, $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $this->authorize('update', $notification);

        $notification->update($request->validated());
        return $this->successResponse(new NotificationResource($notification), 'Notification updated successfully');
    }

    /**
     * DELETE /api/notifications/{id}
     */
    public function destroy($id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $this->authorize('delete', $notification);

        $notification->delete();
        return $this->successResponse(null, 'Notification deleted successfully');
    }

    /**
     * PUT /api/notifications/{id}/read
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $this->notificationService->markAsRead((int) $id, $user->id);

        return $this->successResponse(null, 'Notification marked as read');
    }

    /**
     * PUT /api/notifications/read-all
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = $this->notificationService->markAllAsRead($user->id);

        return $this->successResponse(['marked_count' => $count], 'All notifications marked as read');
    }

    /**
     * POST /api/notifications/bulk
     */
    public function bulk(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'action' => 'required|string|in:read,archive,delete',
        ]);

        $user = $request->user();
        $affected = $this->notificationService->bulkAction($request->input('ids'), $user->id, $request->input('action'));

        return $this->successResponse(['affected' => $affected], 'Bulk action completed successfully');
    }

    /**
     * DELETE /api/notifications/clear
     */
    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->notificationService->clearAllForUser($user->id);

        return $this->successResponse(null, 'Notifications cleared successfully');
    }

    /**
     * GET /api/notifications/export
     */
    public function export(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only(['type', 'priority', 'status', 'start_date', 'end_date']);
        $paginated = $this->notificationService->getNotificationsForUser($user, $filters, 1000);

        $data = NotificationResource::collection($paginated);

        return response()->json([
            'version' => '1.0',
            'exported_at' => now()->toIso8601String(),
            'total' => count($data),
            'notifications' => $data,
        ]);
    }
}
