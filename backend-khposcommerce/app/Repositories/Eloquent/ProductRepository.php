<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Eloquent\Product\ProductRepository as DomainProductRepository;
use App\Repositories\Contracts\ProductRepositoryInterface;

class ProductRepository extends DomainProductRepository implements ProductRepositoryInterface
{
}
