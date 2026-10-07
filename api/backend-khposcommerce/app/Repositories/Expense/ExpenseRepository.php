<?php

namespace App\Repositories\Expense;

use App\Repositories\BaseRepository;
use App\Models\Expense\Expense;

class ExpenseRepository extends BaseRepository
{
    public function __construct(Expense $model)
    {
        parent::__construct($model);
    }
}
