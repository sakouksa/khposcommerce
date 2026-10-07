<?php

namespace App\Services\Product;

use App\Repositories\Product\ProductVariantValueRepository;
use App\Services\BaseService;

class ProductVariantValueService extends BaseService
{
    public function __construct(ProductVariantValueRepository $repository)
    {
        parent::__construct($repository);
    }
}
