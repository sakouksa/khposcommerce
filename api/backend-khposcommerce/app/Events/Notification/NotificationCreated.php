<?php

namespace App\Events\Notification;

use App\Models\Notification\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Notification $notification;
    public array $userIds;

    public function __construct(Notification $notification, array $userIds = [])
    {
        $this->notification = $notification;
        $this->userIds = $userIds;
    }

    public function broadcastOn(): array
    {
        $channels = [];
        if ($this->notification->is_global) {
            $channels[] = new Channel('notifications.global');
        } else {
            foreach ($this->userIds as $uid) {
                $channels[] = new PrivateChannel('user.' . $uid);
            }
        }
        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'type' => $this->notification->type,
            'priority' => $this->notification->priority,
            'icon' => $this->notification->icon,
            'color' => $this->notification->color,
            'action_url' => $this->notification->action_url,
            'created_at' => $this->notification->created_at->toIso8601String(),
        ];
    }
}
