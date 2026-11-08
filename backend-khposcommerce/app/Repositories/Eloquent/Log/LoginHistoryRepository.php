<?php

namespace App\Repositories\Eloquent\Log;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Log\LoginHistory;

class LoginHistoryRepository extends BaseRepository
{
    public function __construct(LoginHistory $model)
    {
        parent::__construct($model);
    }
}
