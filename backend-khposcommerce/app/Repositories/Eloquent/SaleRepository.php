<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Eloquent\Sales\SaleRepository as DomainSaleRepository;
use App\Repositories\Contracts\SaleRepositoryInterface;

class SaleRepository extends DomainSaleRepository implements SaleRepositoryInterface
{
}
