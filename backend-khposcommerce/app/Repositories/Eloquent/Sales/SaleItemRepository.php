<?php

namespace App\Repositories\Eloquent\Sales;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Sales\SaleItem;

class SaleItemRepository extends BaseRepository
{
    public function __construct(SaleItem $model)
    {
        parent::__construct($model);
    }
}
