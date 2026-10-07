<?php

namespace App\Repositories\Eloquent\POS;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\POS\CashRegister;

class CashRegisterRepository extends BaseRepository
{
    public function __construct(CashRegister $model)
    {
        parent::__construct($model);
    }
}
