<?php

namespace App\Repositories\Payment;

use App\Repositories\BaseRepository;
use App\Models\Payment\Transaction;

class TransactionRepository extends BaseRepository
{
    public function __construct(Transaction $model)
    {
        parent::__construct($model);
    }
}
