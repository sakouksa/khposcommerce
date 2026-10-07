<?php

namespace App\Actions\Order;

use App\Models\Order\Order;
use Illuminate\Support\Facades\DB;

class CreateOrderAction
{
    /**
     * Create e-commerce or ERP sales order with lines.
     */
    public function execute(array $orderData, array $items = []): Order
    {
        return DB::transaction(function () use ($orderData, $items) {
            $order = Order::create($orderData);

            if (!empty($items)) {
                $order->items()->createMany($items);
            }

            return $order->load('items');
        });
    }
}
