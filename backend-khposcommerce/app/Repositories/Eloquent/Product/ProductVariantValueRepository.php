<?php

namespace App\Repositories\Eloquent\Product;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Product\ProductVariantValue;

class ProductVariantValueRepository extends BaseRepository
{
    public function __construct(ProductVariantValue $model)
    {
        parent::__construct($model);
    }
}
