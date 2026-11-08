<?php

namespace App\Repositories\Eloquent\POS;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\POS\CashRegisterTransaction;

class CashRegisterTransactionRepository extends BaseRepository
{
    public function __construct(CashRegisterTransaction $model)
    {
        parent::__construct($model);
    }
}
