<?php

namespace App\Repositories\Eloquent\Product;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Product\Tax;

class TaxRepository extends BaseRepository
{
    public function __construct(Tax $model)
    {
        parent::__construct($model);
    }
}
