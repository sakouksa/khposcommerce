<?php

namespace App\Repositories\Sales;

use App\Repositories\BaseRepository;
use App\Models\Sales\Sale;

class SaleRepository extends BaseRepository
{
    public function __construct(Sale $model)
    {
        parent::__construct($model);
    }
}
