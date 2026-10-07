<?php

namespace App\Repositories\Eloquent\Notification;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Notification\NotificationLog;

class NotificationLogRepository extends BaseRepository
{
    public function __construct(NotificationLog $model)
    {
        parent::__construct($model);
    }
}
