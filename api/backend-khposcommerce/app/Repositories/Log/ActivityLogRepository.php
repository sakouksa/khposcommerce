<?php

namespace App\Repositories\Log;

use App\Repositories\BaseRepository;
use App\Models\Log\ActivityLog;

class ActivityLogRepository extends BaseRepository
{
    public function __construct(ActivityLog $model)
    {
        parent::__construct($model);
    }
}
