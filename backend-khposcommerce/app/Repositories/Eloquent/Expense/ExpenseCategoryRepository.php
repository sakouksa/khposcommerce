<?php

namespace App\Repositories\Eloquent\Expense;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Expense\ExpenseCategory;

class ExpenseCategoryRepository extends BaseRepository
{
    public function __construct(ExpenseCategory $model)
    {
        parent::__construct($model);
    }
}
