<?php

namespace App\Repositories\Eloquent\Product;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Product\ProductPrice;

class ProductPriceRepository extends BaseRepository
{
    public function __construct(ProductPrice $model)
    {
        parent::__construct($model);
    }
}
