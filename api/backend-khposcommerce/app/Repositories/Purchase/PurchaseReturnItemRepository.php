<?php

namespace App\Repositories\Purchase;

use App\Repositories\BaseRepository;
use App\Models\Purchase\PurchaseReturnItem;

class PurchaseReturnItemRepository extends BaseRepository
{
    public function __construct(PurchaseReturnItem $model)
    {
        parent::__construct($model);
    }
}
