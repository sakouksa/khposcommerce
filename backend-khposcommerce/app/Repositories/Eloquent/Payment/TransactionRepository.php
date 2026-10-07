<?php

namespace App\Repositories\Eloquent\Payment;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Payment\Transaction;

class TransactionRepository extends BaseRepository
{
    public function __construct(Transaction $model)
    {
        parent::__construct($model);
    }
}
