<?php

namespace App\Actions\Order;

use App\Models\Order\Order;
use App\Models\Order\OrderReturn;
use Illuminate\Support\Facades\DB;

class ReturnOrderAction
{
    public function execute(Order|int|string $order, array $returnData): OrderReturn
    {
        return DB::transaction(function () use ($order, $returnData) {
            $orderModel = $order instanceof Order ? $order : Order::findOrFail($order);
            $returnData['order_id'] = $orderModel->id;
            $returnData['company_id'] = $orderModel->company_id;
            return OrderReturn::create($returnData);
        });
    }
}
