<?php

namespace App\Repositories\Product;

use App\Repositories\BaseRepository;
use App\Models\Product\Unit;

class UnitRepository extends BaseRepository
{
    public function __construct(Unit $model)
    {
        parent::__construct($model);
    }
}
