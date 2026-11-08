<?php

namespace App\Repositories\Eloquent\Purchase;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Purchase\Purchase;

class PurchaseRepository extends BaseRepository
{
    public function __construct(Purchase $model)
    {
        parent::__construct($model);
    }
}
