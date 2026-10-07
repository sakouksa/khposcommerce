<?php

namespace App\Repositories\Eloquent\Purchase;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Purchase\PurchaseItem;

class PurchaseItemRepository extends BaseRepository
{
    public function __construct(PurchaseItem $model)
    {
        parent::__construct($model);
    }
}
