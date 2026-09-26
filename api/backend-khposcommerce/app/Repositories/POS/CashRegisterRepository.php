<?php

namespace App\Repositories\POS;

use App\Repositories\BaseRepository;
use App\Models\POS\CashRegister;

class CashRegisterRepository extends BaseRepository
{
    public function __construct(CashRegister $model)
    {
        parent::__construct($model);
    }
}
