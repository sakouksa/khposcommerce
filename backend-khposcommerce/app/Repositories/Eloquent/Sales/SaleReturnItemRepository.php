<?php

namespace App\Repositories\Eloquent\Sales;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Sales\SaleReturnItem;

class SaleReturnItemRepository extends BaseRepository
{
    public function __construct(SaleReturnItem $model)
    {
        parent::__construct($model);
    }
}
