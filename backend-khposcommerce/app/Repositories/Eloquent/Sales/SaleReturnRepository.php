<?php

namespace App\Repositories\Eloquent\Sales;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Sales\SaleReturn;

class SaleReturnRepository extends BaseRepository
{
    public function __construct(SaleReturn $model)
    {
        parent::__construct($model);
    }
}
