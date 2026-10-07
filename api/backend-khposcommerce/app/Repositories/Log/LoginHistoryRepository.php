<?php

namespace App\Repositories\Log;

use App\Repositories\BaseRepository;
use App\Models\Log\LoginHistory;

class LoginHistoryRepository extends BaseRepository
{
    public function __construct(LoginHistory $model)
    {
        parent::__construct($model);
    }
}
