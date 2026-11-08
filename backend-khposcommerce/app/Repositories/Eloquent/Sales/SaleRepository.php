<?php

namespace App\Repositories\Eloquent\Sales;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Sales\Sale;

class SaleRepository extends BaseRepository
{
    public function __construct(Sale $model)
    {
        parent::__construct($model);
    }
}
