<?php

namespace App\Repositories\Notification;

use App\Repositories\BaseRepository;
use App\Models\Notification\NotificationLog;

class NotificationLogRepository extends BaseRepository
{
    public function __construct(NotificationLog $model)
    {
        parent::__construct($model);
    }
}
