<?php

namespace App\Repositories\Eloquent\Inventory;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Inventory\Inventory;

class InventoryRepository extends BaseRepository
{
    public function __construct(Inventory $model)
    {
        parent::__construct($model);
    }
}
