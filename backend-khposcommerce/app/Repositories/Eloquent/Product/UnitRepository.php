<?php

namespace App\Repositories\Eloquent\Product;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Product\Unit;

class UnitRepository extends BaseRepository
{
    public function __construct(Unit $model)
    {
        parent::__construct($model);
    }
}
