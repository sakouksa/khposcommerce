<?php

namespace App\Repositories\Purchase;

use App\Repositories\BaseRepository;
use App\Models\Purchase\PurchaseItem;

class PurchaseItemRepository extends BaseRepository
{
    public function __construct(PurchaseItem $model)
    {
        parent::__construct($model);
    }
}
