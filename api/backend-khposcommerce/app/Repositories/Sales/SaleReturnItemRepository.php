<?php

namespace App\Repositories\Sales;

use App\Repositories\BaseRepository;
use App\Models\Sales\SaleReturnItem;

class SaleReturnItemRepository extends BaseRepository
{
    public function __construct(SaleReturnItem $model)
    {
        parent::__construct($model);
    }
}
