<?php

namespace App\Repositories\Product;

use App\Repositories\BaseRepository;
use App\Models\Product\Tax;

class TaxRepository extends BaseRepository
{
    public function __construct(Tax $model)
    {
        parent::__construct($model);
    }
}
