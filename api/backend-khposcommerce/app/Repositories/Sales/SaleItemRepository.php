<?php

namespace App\Repositories\Sales;

use App\Repositories\BaseRepository;
use App\Models\Sales\SaleItem;

class SaleItemRepository extends BaseRepository
{
    public function __construct(SaleItem $model)
    {
        parent::__construct($model);
    }
}
