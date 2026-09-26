<?php

namespace App\Listeners;

use App\Events\Notification\NotificationCreated;
use Illuminate\Support\Facades\Log;

class BroadcastNotification
{
    public function handle(NotificationCreated $event): void
    {
        Log::info("Notification broadcasted to user IDs: " . implode(',', $event->userIds) . " for title: {$event->notification->title}");
    }
}
