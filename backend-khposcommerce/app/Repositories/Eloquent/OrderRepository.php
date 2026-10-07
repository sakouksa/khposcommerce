<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Eloquent\Order\OrderRepository as DomainOrderRepository;
use App\Repositories\Contracts\OrderRepositoryInterface;

class OrderRepository extends DomainOrderRepository implements OrderRepositoryInterface
{
}
