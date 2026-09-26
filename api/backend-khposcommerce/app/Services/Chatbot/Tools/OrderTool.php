<?php

namespace App\Services\Chatbot\Tools;

use App\Models\Order\Order;
use App\Models\Customer\Customer;

class OrderTool
{
    /**
     * Get order status and tracking details.
     */
    public function getOrderStatus(array $params, array $context): array
    {
        $orderNumber = trim($params['order_number'] ?? '');
        $customerId = $context['customer_id'] ?? null;

        if (empty($orderNumber)) {
            return [
                'found'   => false,
                'message' => 'Please provide an order number (e.g. ORD-1025 or ORD-XXXXX).',
            ];
        }

        $query = Order::query()
            ->with(['items', 'shipment.shippingMethod', 'shippingMethod', 'statusHistories'])
            ->where('order_number', $orderNumber);

        // Security check: if customer is logged in, ensure ownership
        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        $order = $query->first();

        if (!$order) {
            return [
                'found'   => false,
                'message' => "Order #{$orderNumber} was not found or does not belong to your account.",
            ];
        }

        return [
            'found'        => true,
            'order'        => $this->formatOrderSummary($order),
        ];
    }

    /**
     * Get customer order history.
     */
    public function getOrderHistory(array $params, array $context): array
    {
        $customerId = $context['customer_id'] ?? null;

        if (!$customerId) {
            return [
                'authenticated' => false,
                'found'         => false,
                'message'       => 'Please log in to your store account to view your past order history.',
                'orders'        => [],
            ];
        }

        $limit = min((int) ($params['limit'] ?? 5), 10);

        $orders = Order::query()
            ->where('customer_id', $customerId)
            ->with(['items', 'shipment'])
            ->latest()
            ->limit($limit)
            ->get();

        return [
            'authenticated' => true,
            'found'         => $orders->isNotEmpty(),
            'count'         => $orders->count(),
            'orders'        => $orders->map(fn ($o) => $this->formatOrderSummary($o))->toArray(),
        ];
    }

    private function formatOrderSummary(Order $order): array
    {
        $shipment = $order->shipment;

        return [
            'id'                   => $order->id,
            'order_number'         => $order->order_number,
            'status'               => $order->status,
            'payment_status'       => $order->payment_status,
            'fulfillment_status'   => $order->fulfillment_status,
            'grand_total'          => (float) $order->grand_total,
            'currency'             => $order->currency_code ?? 'USD',
            'created_at'           => $order->created_at->format('Y-m-d H:i'),
            'shipping_method'      => $order->shippingMethod?->name ?? 'Standard Shipping',
            'shipping_carrier'     => $shipment?->carrier ?? $order->shippingMethod?->carrier,
            'tracking_number'      => $shipment?->tracking_number,
            'estimated_delivery'   => $shipment?->shipped_at ? 'In Transit - Estimated 1-3 Business Days' : 'Processing for Dispatch',
            'items_count'          => $order->items->count(),
            'items'                => $order->items->map(fn ($i) => [
                'name'     => $i->product_name,
                'quantity' => (float) $i->quantity,
                'price'    => (float) $i->unit_price,
                'total'    => (float) $i->total,
            ])->toArray(),
        ];
    }
}
