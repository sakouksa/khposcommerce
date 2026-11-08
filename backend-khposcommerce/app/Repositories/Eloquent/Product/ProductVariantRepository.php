<?php

namespace App\Repositories\Eloquent\Product;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Product\ProductVariant;

class ProductVariantRepository extends BaseRepository
{
    public function __construct(ProductVariant $model)
    {
        parent::__construct($model);
    }
}
