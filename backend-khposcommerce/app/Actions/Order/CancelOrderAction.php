<?php

namespace App\Actions\Order;

use App\Models\Order\Order;

class CancelOrderAction
{
    public function execute(Order|int|string $order, string $reason = ''): Order
    {
        $orderModel = $order instanceof Order ? $order : Order::findOrFail($order);
        $orderModel->update([
            'status' => 'cancelled',
            'notes' => $reason,
        ]);
        return $orderModel;
    }
}
