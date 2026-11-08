<?php

namespace App\Repositories\Eloquent\Order;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Order\Order;

use App\Repositories\Contracts\Order\OrderRepositoryInterface;

class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    public function __construct(Order $model)
    {
        parent::__construct($model);
    }

    public function findByOrderNumber(string $orderNumber)
    {
        return $this->model->where('order_number', $orderNumber)->first();
    }

    public function getCustomerOrders(int $customerId, int $perPage = 15)
    {
        return $this->model->where('customer_id', $customerId)
            ->latest()
            ->paginate($perPage);
    }
}
