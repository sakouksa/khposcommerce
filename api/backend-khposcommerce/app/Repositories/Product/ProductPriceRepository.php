<?php

namespace App\Repositories\Product;

use App\Repositories\BaseRepository;
use App\Models\Product\ProductPrice;

class ProductPriceRepository extends BaseRepository
{
    public function __construct(ProductPrice $model)
    {
        parent::__construct($model);
    }
}
