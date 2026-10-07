<?php

namespace App\Repositories\Inventory;

use App\Repositories\BaseRepository;
use App\Models\Inventory\StockAdjustmentItem;

class StockAdjustmentItemRepository extends BaseRepository
{
    public function __construct(StockAdjustmentItem $model)
    {
        parent::__construct($model);
    }
}
