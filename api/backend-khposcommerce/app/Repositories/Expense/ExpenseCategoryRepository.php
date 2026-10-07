<?php

namespace App\Repositories\Expense;

use App\Repositories\BaseRepository;
use App\Models\Expense\ExpenseCategory;

class ExpenseCategoryRepository extends BaseRepository
{
    public function __construct(ExpenseCategory $model)
    {
        parent::__construct($model);
    }
}
