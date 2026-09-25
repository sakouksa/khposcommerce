<?php

namespace App\Repositories\POS;

use App\Repositories\BaseRepository;
use App\Models\POS\CashRegisterTransaction;

class CashRegisterTransactionRepository extends BaseRepository
{
    public function __construct(CashRegisterTransaction $model)
    {
        parent::__construct($model);
    }
}
