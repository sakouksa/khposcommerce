<?php

namespace App\Repositories\Product;

use App\Repositories\BaseRepository;
use App\Models\Product\ProductImage;

class ProductImageRepository extends BaseRepository
{
    public function __construct(ProductImage $model)
    {
        parent::__construct($model);
    }
}
