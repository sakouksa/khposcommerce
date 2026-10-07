<?php

namespace App\Repositories\Eloquent\Inventory;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Inventory\StockTransferItem;

class StockTransferItemRepository extends BaseRepository
{
    public function __construct(StockTransferItem $model)
    {
        parent::__construct($model);
    }
}
