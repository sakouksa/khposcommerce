<?php

namespace App\Repositories\Inventory;

use App\Repositories\BaseRepository;
use App\Models\Inventory\StockTransferItem;

class StockTransferItemRepository extends BaseRepository
{
    public function __construct(StockTransferItem $model)
    {
        parent::__construct($model);
    }
}
