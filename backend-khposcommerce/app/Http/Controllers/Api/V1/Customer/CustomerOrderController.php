<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Order\Order;
use App\Models\Customer\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends BaseApiController
{
    // ─── GET /api/v1/customer/orders (my orders for authenticated customer) ───

    public function myOrders(Request $request): JsonResponse
    {
        $customer = Customer::where('user_id', $request->user()->id)->first();

        if (!$customer) {
            return $this->successResponse([]);
        }

        $query = Order::where('customer_id', $customer->id)
            ->with(['items.product.primaryImage', 'shipment'])
            ->latest();

        if ($status = $request->status) {
            $query->where('status', $status);
        }

        $orders = $query->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($orders);
    }

    // ─── GET /api/v1/customer/orders/{number} or /api/v1/customer/track/{number}

    public function trackByNumber(Request $request, string $number): JsonResponse
    {
        $query = Order::where('order_number', $number)
            ->with(['statusHistories', 'shipment', 'items.product.primaryImage']);

        // For guest tracking: require email match
        if ($email = $request->input('email')) {
            $query->whereHas('customer', fn($q) => $q->where('email', $email));
        } elseif ($request->user()) {
            $customer = Customer::where('user_id', $request->user()->id)->first();
            if ($customer) {
                $query->where('customer_id', $customer->id);
            }
        }

        $order = $query->first();

        if (!$order) {
            return $this->errorResponse('Order not found', null, 404);
        }

        return $this->successResponse([
            'order_number'   => $order->order_number,
            'status'         => $order->status,
            'payment_status' => $order->payment_status,
            'grand_total'    => (float) $order->grand_total,
            'currency_code'  => $order->currency_code,
            'created_at'     => $order->created_at?->toISOString(),
            'items'          => $order->items->map(fn($i) => [
                'name'     => $i->product_name,
                'quantity' => (float) $i->quantity,
                'image'    => $i->product?->primaryImage?->url,
            ]),
            'timeline'       => $order->statusHistories->map(fn($h) => [
                'status'     => $h->status,
                'comment'    => $h->comment,
                'created_at' => $h->created_at?->toISOString(),
            ]),
            'shipment'       => $order->shipment ? [
                'carrier'         => $order->shipment->carrier,
                'tracking_number' => $order->shipment->tracking_number,
                'status'          => $order->shipment->status,
            ] : null,
        ]);
    }
}
