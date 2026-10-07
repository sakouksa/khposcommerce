<?php

namespace App\Services\Product;

use App\Repositories\Product\ProductPriceRepository;
use App\Services\BaseService;

class ProductPriceService extends BaseService
{
    public function __construct(ProductPriceRepository $repository)
    {
        parent::__construct($repository);
    }
}
