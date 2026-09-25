<?php

namespace App\Repositories\Product;

use App\Repositories\BaseRepository;
use App\Models\Product\ProductVariant;

class ProductVariantRepository extends BaseRepository
{
    public function __construct(ProductVariant $model)
    {
        parent::__construct($model);
    }
}
