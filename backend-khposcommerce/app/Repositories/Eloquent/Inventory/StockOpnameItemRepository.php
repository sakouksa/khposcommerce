<?php

namespace App\Repositories\Eloquent\Inventory;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Inventory\StockOpnameItem;

class StockOpnameItemRepository extends BaseRepository
{
    public function __construct(StockOpnameItem $model)
    {
        parent::__construct($model);
    }
}
