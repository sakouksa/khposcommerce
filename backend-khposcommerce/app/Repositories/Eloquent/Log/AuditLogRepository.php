<?php

namespace App\Repositories\Eloquent\Log;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Log\AuditLog;

class AuditLogRepository extends BaseRepository
{
    public function __construct(AuditLog $model)
    {
        parent::__construct($model);
    }
}
