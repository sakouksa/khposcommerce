<?php

namespace App\Repositories\Inventory;

use App\Repositories\BaseRepository;
use App\Models\Inventory\StockOpnameItem;

class StockOpnameItemRepository extends BaseRepository
{
    public function __construct(StockOpnameItem $model)
    {
        parent::__construct($model);
    }
}
