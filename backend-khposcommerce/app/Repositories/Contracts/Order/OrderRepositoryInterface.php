<?php

namespace App\Repositories\Contracts\Order;

use App\Repositories\Contracts\BaseRepositoryInterface;

interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    public function findByOrderNumber(string $orderNumber);
    public function getCustomerOrders(int $customerId, int $perPage = 15);
}
