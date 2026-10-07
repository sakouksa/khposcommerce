<?php

namespace App\Repositories\Sales;

use App\Repositories\BaseRepository;
use App\Models\Sales\SaleReturn;

class SaleReturnRepository extends BaseRepository
{
    public function __construct(SaleReturn $model)
    {
        parent::__construct($model);
    }
}
