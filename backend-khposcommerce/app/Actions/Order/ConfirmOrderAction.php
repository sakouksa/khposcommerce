<?php

namespace App\Actions\Order;

use App\Models\Order\Order;

class ConfirmOrderAction
{
    public function execute(Order|int|string $order): Order
    {
        $orderModel = $order instanceof Order ? $order : Order::findOrFail($order);
        $orderModel->update(['status' => 'confirmed']);
        return $orderModel;
    }
}
