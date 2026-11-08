<?php

namespace App\Services\Order;

use App\Models\Order\Order;

class CheckoutService
{
    public function __construct(protected ?OrderService $orderService = null)
    {
    }

    public function processCheckout(array $orderData, array $items = []): Order
    {
        return $this->orderService ? $this->orderService->create($orderData, $items) : Order::create($orderData);
    }
}
