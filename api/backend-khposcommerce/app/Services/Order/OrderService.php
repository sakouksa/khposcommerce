<?php

namespace App\Services\Order;

use App\Repositories\Contracts\Order\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use App\Models\Order\Order;

class OrderService
{
    protected OrderRepositoryInterface $orderRepository;

    public function __construct(OrderRepositoryInterface $orderRepository)
    {
        $this->orderRepository = $orderRepository;
    }

    public function confirm(int $id): Order
    {
        return DB::transaction(function () use ($id) {
            $order = $this->orderRepository->findById($id);
            $order->addStatusHistory('confirmed', 'Order has been confirmed by shop admin', true);
            return $order;
        });
    }

    public function ship(int $id, string $carrier, string $trackingNumber): Order
    {
        return DB::transaction(function () use ($id, $carrier, $trackingNumber) {
            $order = $this->orderRepository->findById($id);

            $order->shipment()->create([
                'tracking_number' => $trackingNumber,
                'carrier'         => $carrier,
                'status'          => 'shipped',
                'shipped_at'      => now(),
            ]);

            $order->addStatusHistory('shipped', "Order shipped via {$carrier} - Tracking: {$trackingNumber}", true);

            return $order;
        });
    }

    public function complete(int $id): Order
    {
        return DB::transaction(function () use ($id) {
            $order = $this->orderRepository->findById($id);
            $order->addStatusHistory('completed', 'Order marked as completed', true);
            return $order;
        });
    }

    public function cancel(int $id): Order
    {
        return DB::transaction(function () use ($id) {
            $order = $this->orderRepository->findById($id);
            $order->addStatusHistory('cancelled', 'Order cancelled by shop admin', true);
            return $order;
        });
    }
}
