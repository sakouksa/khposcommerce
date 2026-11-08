<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Eloquent\Inventory\InventoryRepository as DomainInventoryRepository;
use App\Repositories\Contracts\InventoryRepositoryInterface;

class InventoryRepository extends DomainInventoryRepository implements InventoryRepositoryInterface
{
}
