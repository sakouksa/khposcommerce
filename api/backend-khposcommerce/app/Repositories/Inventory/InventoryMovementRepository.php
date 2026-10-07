<?php

namespace App\Repositories\Inventory;

use App\Repositories\BaseRepository;
use App\Models\Inventory\InventoryMovement;

class InventoryMovementRepository extends BaseRepository
{
    public function __construct(InventoryMovement $model)
    {
        parent::__construct($model);
    }
}
