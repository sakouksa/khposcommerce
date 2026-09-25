<?php

namespace App\Services\Notification;

use App\Models\Notification\Notification;
use App\Models\Notification\NotificationUser;
use App\Models\Notification\NotificationLog;
use App\Models\Notification\NotificationTemplate;
use App\Models\User;
use App\Events\Notification\NotificationCreated;
use App\Jobs\SendNotificationJob;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Get paginated notifications for a given user with filters.
     */
    public function getNotificationsForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Notification::query()
            ->with(['company', 'branch', 'creator', 'notificationUsers' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);

        // Company & Branch Scopes
        if ($user->company_id && !$user->hasRole('Super Admin')) {
            $query->forCompany($user->company_id);
        } elseif (!empty($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        // Targeted user or global
        $query->where(function ($q) use ($user) {
            $q->where('is_global', true)
              ->orWhereHas('notificationUsers', function ($nu) use ($user) {
                  $nu->where('user_id', $user->id);
              });
        });

        // Filter by Tab / Read status
        if (!empty($filters['tab'])) {
            switch ($filters['tab']) {
                case 'unread':
                    $query->whereHas('notificationUsers', function ($nu) use ($user) {
                        $nu->where('user_id', $user->id)->where('is_read', false);
                    });
                    break;
                case 'read':
                    $query->whereHas('notificationUsers', function ($nu) use ($user) {
                        $nu->where('user_id', $user->id)->where('is_read', true);
                    });
                    break;
                case 'archived':
                    $query->whereHas('notificationUsers', function ($nu) use ($user) {
                        $nu->where('user_id', $user->id)->where('is_archived', true);
                    });
                    break;
            }
        } else {
            // Exclude archived by default unless requested
            if (empty($filters['include_archived'])) {
                $query->whereDoesntHave('notificationUsers', function ($nu) use ($user) {
                    $nu->where('user_id', $user->id)->where('is_archived', true);
                });
            }
        }

        // Search
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        // Enums & Filters
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get unread notifications for navbar dropdown.
     */
    public function getUnreadForUser(User $user, int $limit = 10): array
    {
        $notifications = Notification::query()
            ->with(['company', 'branch', 'creator'])
            ->where(function ($q) use ($user) {
                $q->where('is_global', true)
                  ->orWhereHas('notificationUsers', function ($nu) use ($user) {
                      $nu->where('user_id', $user->id);
                  });
            })
            ->whereHas('notificationUsers', function ($nu) use ($user) {
                $nu->where('user_id', $user->id)->where('is_read', false)->where('is_archived', false);
            })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $unreadCount = NotificationUser::where('user_id', $user->id)
            ->where('is_read', false)
            ->where('is_archived', false)
            ->count();

        return [
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ];
    }

    /**
     * Create and dispatch a master notification.
     */
    public function sendNotification(array $data): Notification
    {
        return DB::transaction(function () use ($data) {
            // Template rendering if code supplied
            if (!empty($data['template_code'])) {
                $template = NotificationTemplate::where('code', $data['template_code'])->where('is_active', true)->first();
                if ($template) {
                    $vars = $data['template_data'] ?? [];
                    $data['title'] = $data['title'] ?? $template->renderTitle($vars);
                    $data['message'] = $data['message'] ?? $template->renderMessage($vars);
                    $data['type'] = $data['type'] ?? $template->type;
                    $data['priority'] = $data['priority'] ?? $template->priority;
                    $data['icon'] = $data['icon'] ?? $template->icon;
                    $data['color'] = $data['color'] ?? $template->color;
                }
            }

            $notification = Notification::create([
                'company_id' => $data['company_id'] ?? null,
                'branch_id' => $data['branch_id'] ?? null,
                'type' => $data['type'] ?? 'system',
                'title' => $data['title'],
                'message' => $data['message'],
                'icon' => $data['icon'] ?? 'bell',
                'color' => $data['color'] ?? '#3b82f6',
                'priority' => $data['priority'] ?? 'normal',
                'image' => $data['image'] ?? null,
                'action_url' => $data['action_url'] ?? null,
                'reference_type' => $data['reference_type'] ?? null,
                'reference_id' => $data['reference_id'] ?? null,
                'created_by' => $data['created_by'] ?? auth()->id(),
                'expires_at' => $data['expires_at'] ?? null,
                'is_global' => $data['is_global'] ?? false,
                'status' => 'sent',
            ]);

            // Resolve target users
            $userIds = [];
            if (!empty($data['is_global'])) {
                $userIds = User::pluck('id')->toArray();
            } else {
                if (!empty($data['user_ids'])) {
                    $userIds = (array) $data['user_ids'];
                }
                if (!empty($data['role'])) {
                    $roleUsers = User::role($data['role'])->pluck('id')->toArray();
                    $userIds = array_unique(array_merge($userIds, $roleUsers));
                }
                if (!empty($data['permission'])) {
                    $permissionUsers = User::permission($data['permission'])->pluck('id')->toArray();
                    $userIds = array_unique(array_merge($userIds, $permissionUsers));
                }
                if (empty($userIds) && !empty($data['company_id'])) {
                    $userIds = User::where('company_id', $data['company_id'])->pluck('id')->toArray();
                }
            }

            // Create notification_users records
            $pivotData = [];
            $now = Carbon::now();
            foreach ($userIds as $uid) {
                $pivotData[] = [
                    'notification_id' => $notification->id,
                    'user_id' => $uid,
                    'is_read' => false,
                    'is_archived' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (!empty($pivotData)) {
                NotificationUser::insertOrIgnore($pivotData);
            }

            // Create initial database log record
            $channels = $data['channels'] ?? ['database'];
            foreach ($channels as $channel) {
                foreach ($userIds as $uid) {
                    NotificationLog::create([
                        'notification_id' => $notification->id,
                        'user_id' => $uid,
                        'channel' => $channel,
                        'status' => 'sent',
                        'sent_at' => $now,
                        'response' => json_encode(['message' => 'Successfully queued/sent']),
                    ]);
                }
            }

            // Dispatch background queue job & broadcast event
            event(new NotificationCreated($notification, $userIds));
            SendNotificationJob::dispatch($notification, $userIds, $channels);

            return $notification;
        });
    }

    /**
     * Mark a single notification as read for user.
     */
    public function markAsRead(int $notificationId, int $userId): bool
    {
        $nu = NotificationUser::where('notification_id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if (!$nu) {
            $nu = NotificationUser::create([
                'notification_id' => $notificationId,
                'user_id' => $userId,
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);
            return true;
        }

        return $nu->update([
            'is_read' => true,
            'read_at' => Carbon::now(),
        ]);
    }

    /**
     * Mark all notifications as read for user.
     */
    public function markAllAsRead(int $userId): int
    {
        return NotificationUser::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => Carbon::now(),
            ]);
    }

    /**
     * Bulk action: read, archive, or delete.
     */
    public function bulkAction(array $notificationIds, int $userId, string $action): int
    {
        if (empty($notificationIds)) return 0;

        switch ($action) {
            case 'read':
                return NotificationUser::whereIn('notification_id', $notificationIds)
                    ->where('user_id', $userId)
                    ->update([
                        'is_read' => true,
                        'read_at' => Carbon::now(),
                    ]);
            case 'archive':
                return NotificationUser::whereIn('notification_id', $notificationIds)
                    ->where('user_id', $userId)
                    ->update(['is_archived' => true]);
            case 'delete':
                return NotificationUser::whereIn('notification_id', $notificationIds)
                    ->where('user_id', $userId)
                    ->delete();
            default:
                return 0;
        }
    }

    /**
     * Clear all notifications for user.
     */
    public function clearAllForUser(int $userId): int
    {
        return NotificationUser::where('user_id', $userId)->delete();
    }
}
