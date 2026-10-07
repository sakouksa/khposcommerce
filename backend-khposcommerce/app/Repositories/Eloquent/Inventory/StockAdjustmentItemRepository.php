<?php

namespace App\Repositories\Eloquent\Inventory;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Inventory\StockAdjustmentItem;

class StockAdjustmentItemRepository extends BaseRepository
{
    public function __construct(StockAdjustmentItem $model)
    {
        parent::__construct($model);
    }
}
