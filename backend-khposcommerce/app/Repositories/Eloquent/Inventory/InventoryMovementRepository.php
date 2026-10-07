<?php

namespace App\Repositories\Eloquent\Inventory;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Inventory\InventoryMovement;

class InventoryMovementRepository extends BaseRepository
{
    public function __construct(InventoryMovement $model)
    {
        parent::__construct($model);
    }
}
