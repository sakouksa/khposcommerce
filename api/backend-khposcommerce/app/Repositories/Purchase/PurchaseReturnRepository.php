<?php

namespace App\Repositories\Purchase;

use App\Repositories\BaseRepository;
use App\Models\Purchase\PurchaseReturn;

class PurchaseReturnRepository extends BaseRepository
{
    public function __construct(PurchaseReturn $model)
    {
        parent::__construct($model);
    }
}
