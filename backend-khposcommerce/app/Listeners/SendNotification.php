<?php

namespace App\Listeners;

use App\Events\Notification\NotificationCreated;
use App\Jobs\SendNotificationJob;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendNotification implements ShouldQueue
{
    public function handle(NotificationCreated $event): void
    {
        SendNotificationJob::dispatch($event->notification, $event->userIds, ['database']);
    }
}
