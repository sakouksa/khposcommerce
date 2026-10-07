<?php

namespace App\Repositories\Purchase;

use App\Repositories\BaseRepository;
use App\Models\Purchase\Purchase;

class PurchaseRepository extends BaseRepository
{
    public function __construct(Purchase $model)
    {
        parent::__construct($model);
    }
}
