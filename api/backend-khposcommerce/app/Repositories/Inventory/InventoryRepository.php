<?php

namespace App\Repositories\Inventory;

use App\Repositories\BaseRepository;
use App\Models\Inventory\Inventory;

class InventoryRepository extends BaseRepository
{
    public function __construct(Inventory $model)
    {
        parent::__construct($model);
    }
}
