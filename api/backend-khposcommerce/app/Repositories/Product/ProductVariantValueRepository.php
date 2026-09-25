<?php

namespace App\Repositories\Product;

use App\Repositories\BaseRepository;
use App\Models\Product\ProductVariantValue;

class ProductVariantValueRepository extends BaseRepository
{
    public function __construct(ProductVariantValue $model)
    {
        parent::__construct($model);
    }
}
