<?php

namespace App\Repositories\Eloquent\Purchase;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Purchase\PurchaseReturnItem;

class PurchaseReturnItemRepository extends BaseRepository
{
    public function __construct(PurchaseReturnItem $model)
    {
        parent::__construct($model);
    }
}
