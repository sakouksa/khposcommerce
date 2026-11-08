<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Eloquent\Purchase\PurchaseRepository as DomainPurchaseRepository;
use App\Repositories\Contracts\PurchaseRepositoryInterface;

class PurchaseRepository extends DomainPurchaseRepository implements PurchaseRepositoryInterface
{
}
