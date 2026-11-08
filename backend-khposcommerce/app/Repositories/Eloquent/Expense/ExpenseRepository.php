<?php

namespace App\Repositories\Eloquent\Expense;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Expense\Expense;

class ExpenseRepository extends BaseRepository
{
    public function __construct(Expense $model)
    {
        parent::__construct($model);
    }
}
