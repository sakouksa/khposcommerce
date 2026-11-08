<?php

namespace App\Repositories\Eloquent\Purchase;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Purchase\PurchaseReturn;

class PurchaseReturnRepository extends BaseRepository
{
    public function __construct(PurchaseReturn $model)
    {
        parent::__construct($model);
    }
}
