<?php

namespace App\Repositories\Eloquent\Product;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Product\ProductImage;

class ProductImageRepository extends BaseRepository
{
    public function __construct(ProductImage $model)
    {
        parent::__construct($model);
    }
}
