<?php

namespace App\Repositories\Log;

use App\Repositories\BaseRepository;
use App\Models\Log\AuditLog;

class AuditLogRepository extends BaseRepository
{
    public function __construct(AuditLog $model)
    {
        parent::__construct($model);
    }
}
