<?php

namespace App\Services\Product;

use App\Repositories\Product\ProductImageRepository;
use App\Services\BaseService;

class ProductImageService extends BaseService
{
    public function __construct(ProductImageRepository $repository)
    {
        parent::__construct($repository);
    }
}
