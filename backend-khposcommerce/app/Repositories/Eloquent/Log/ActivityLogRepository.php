<?php

namespace App\Repositories\Eloquent\Log;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Log\ActivityLog;

class ActivityLogRepository extends BaseRepository
{
    public function __construct(ActivityLog $model)
    {
        parent::__construct($model);
    }
}
