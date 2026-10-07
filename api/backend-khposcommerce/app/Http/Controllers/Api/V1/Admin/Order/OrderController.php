<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Repositories\Contracts\Order\OrderRepositoryInterface;
use App\Services\Order\OrderService;
use App\Http\Requests\Order\ShipOrderRequest;
use App\Models\Order\Order;
use App\Models\Customer\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends BaseApiController
{
    protected OrderRepositoryInterface $orderRepository;
    protected OrderService $orderService;

    public function __construct(
        OrderRepositoryInterface $orderRepository,
        OrderService $orderService
    ) {
        $this->orderRepository = $orderRepository;
        $this->orderService = $orderService;
    }

    // ─── GET /api/v1/orders ──────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Order::with([
                'customer:id,name,email,phone,photo',
                'shippingMethod:id,name,code,provider',
                'payments.paymentMethod:id,name,code',
                'items:id,order_id,product_id,product_name,quantity,unit_price,total',
                'items.product:id,name,category_id',
                'items.product.primaryImage',
                'items.product.category:id,name'
            ]);

        // Search
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('shipping_name', 'like', "%{$search}%")
                  ->orWhere('shipping_phone', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($qc) => $qc->where('name', 'like', "%{$search}%")
                                                          ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        // Status filter
        if ($status = $request->status) {
            $query->where('status', $status);
        }

        // Payment status filter
        if ($paymentStatus = $request->payment_status) {
            $query->where('payment_status', $paymentStatus);
        }

        // Fulfillment status filter
        if ($fulfillmentStatus = $request->fulfillment_status) {
            $query->where('fulfillment_status', $fulfillmentStatus);
        }

        // Min / Max total filters
        if ($request->filled('min_total')) {
            $query->where('grand_total', '>=', $request->min_total);
        }
        if ($request->filled('max_total')) {
            $query->where('grand_total', '<=', $request->max_total);
        }

        // Date range
        if ($dateFrom = $request->date_from) {
            $query->where('created_at', '>=', str_contains($dateFrom, ' ') ? $dateFrom : "{$dateFrom} 00:00:00");
        }
        if ($dateTo = $request->date_to) {
            $query->where('created_at', '<=', str_contains($dateTo, ' ') ? $dateTo : "{$dateTo} 23:59:59");
        }

        // Dynamic Sorting
        $allowedSorts = ['id', 'order_number', 'status', 'payment_status', 'fulfillment_status', 'grand_total', 'created_at'];
        $sortBy = in_array($request->sort, $allowedSorts, true) ? $request->sort : 'created_at';
        $sortOrder = strtolower((string) $request->order) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $orders = $query->paginate($request->integer('per_page', 15));

        $statusCounts = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $totalCount = array_sum($statusCounts);
        $statusCounts['all'] = $totalCount;

        $stats = [
            'total_orders'      => (int) $totalCount,
            'total_revenue'     => (float) Order::sum('grand_total'),
            'pending_count'     => (int) ($statusCounts['pending'] ?? 0),
            'processing_count'  => (int) ($statusCounts['processing'] ?? 0),
            'shipped_count'     => (int) ($statusCounts['shipped'] ?? 0),
            'completed_count'   => (int) ($statusCounts['completed'] ?? 0),
            'cancelled_count'   => (int) ($statusCounts['cancelled'] ?? 0),
            'unpaid_count'      => (int) Order::where('payment_status', 'unpaid')->count(),
            'unpaid_total'      => (float) Order::where('payment_status', 'unpaid')->sum('grand_total'),
            'unfulfilled_count' => (int) Order::where('fulfillment_status', 'unfulfilled')->count(),
        ];

        $response = $this->paginatedResponse($orders);
        $responseData = $response->getData(true);
        $responseData['status_counts'] = $statusCounts;
        $responseData['stats'] = $stats;

        return response()->json($responseData);
    }

    // ─── GET /api/v1/orders/{id} ─────────────────────────────────────────────

    public function show(int $id): JsonResponse
    {
        $order = Order::with([
            'store:id,name',
            'company:id,name',
            'customer.addresses',
            'items.product.primaryImage',
            'items.variant',
            'statusHistories.user',
            'shipment',
            'shippingMethod',
            'payments.paymentMethod',
        ])->findOrFail($id);

        return $this->successResponse($order);
    }

    // ─── POST /api/v1/orders ─────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id'          => 'nullable|integer|exists:customers,id',
            'shipping_name'        => 'required|string|max:191',
            'shipping_phone'       => 'required|string|max:50',
            'shipping_address'     => 'required|string',
            'shipping_city'        => 'required|string|max:100',
            'shipping_country'     => 'required|string|max:100',
            'shipping_method_id'   => 'nullable|integer|exists:shipping_methods,id',
            'shipping_cost'        => 'nullable|numeric|min:0',
            'coupon_code'          => 'nullable|string|max:100',
            'currency_code'        => 'nullable|string|max:10',
            'customer_notes'       => 'nullable|string',
            'admin_notes'          => 'nullable|string',
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'required|integer|exists:products,id',
            'items.*.quantity'     => 'required|numeric|min:0.001',
            'items.*.unit_price'   => 'required|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($validated) {
            $subtotal = collect($validated['items'])->sum(fn($i) => $i['unit_price'] * $i['quantity']);

            $order = Order::create([
                'customer_id'        => $validated['customer_id'] ?? null,
                'order_number'       => 'ORD-' . strtoupper(\Illuminate\Support\Str::random(10)),
                'status'             => 'pending',
                'payment_status'     => 'unpaid',
                'fulfillment_status' => 'unfulfilled',
                'shipping_name'      => $validated['shipping_name'],
                'shipping_phone'     => $validated['shipping_phone'],
                'shipping_address'   => $validated['shipping_address'],
                'shipping_city'      => $validated['shipping_city'],
                'shipping_country'   => $validated['shipping_country'],
                'shipping_method_id' => $validated['shipping_method_id'] ?? null,
                'shipping_cost'      => $validated['shipping_cost'] ?? 0,
                'subtotal'           => $subtotal,
                'discount_amount'    => 0,
                'tax_amount'         => 0,
                'grand_total'        => $subtotal + ($validated['shipping_cost'] ?? 0),
                'coupon_code'        => $validated['coupon_code'] ?? null,
                'currency_code'      => $validated['currency_code'] ?? 'USD',
                'customer_notes'     => $validated['customer_notes'] ?? null,
                'admin_notes'        => $validated['admin_notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $product = \App\Models\Product\Product::find($item['product_id']);
                $itemTotal = $item['unit_price'] * $item['quantity'];
                $order->items()->create([
                    'product_id'   => $item['product_id'],
                    'product_name' => $product->name,
                    'product_sku'  => $product->sku,
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $item['unit_price'],
                    'subtotal'     => $itemTotal,
                    'total'        => $itemTotal,
                ]);
            }

            $order->statusHistories()->create([
                'status'          => 'pending',
                'comment'         => 'Order created by admin',
                'notify_customer' => false,
            ]);

            return $order;
        });

        return $this->successResponse($order->load(['items', 'customer']), 'Order created successfully', 201);
    }

    // ─── PUT /api/v1/orders/{id} ─────────────────────────────────────────────

    public function update(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'shipping_name'    => 'nullable|string|max:191',
            'shipping_phone'   => 'nullable|string|max:50',
            'shipping_address' => 'nullable|string',
            'shipping_city'    => 'nullable|string|max:100',
            'admin_notes'      => 'nullable|string',
            'payment_status'   => 'nullable|in:unpaid,paid,partially_paid,refunded',
        ]);

        $order->update($validated);

        return $this->successResponse($order->fresh(), 'Order updated successfully');
    }

    // ─── PUT /api/v1/orders/{id}/status ──────────────────────────────────────

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status'  => 'required|string|in:pending,confirmed,processing,shipped,delivered,completed,cancelled,refunded',
            'comment' => 'nullable|string|max:500',
        ]);

        $order = Order::findOrFail($id);
        $order->addStatusHistory($validated['status'], $validated['comment'] ?? "Status updated to {$validated['status']}");

        return $this->successResponse($order->fresh(), 'Order status updated successfully');
    }

    // ─── DELETE /api/v1/orders/{id} ──────────────────────────────────────────

    public function destroy(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return $this->successResponse(null, 'Order deleted successfully');
    }

    // ─── POST /api/v1/orders/{id}/confirm ────────────────────────────────────

    public function confirm(int $id): JsonResponse
    {
        $order = $this->orderService->confirm($id);
        return $this->successResponse($order, 'Order confirmed successfully');
    }

    // ─── POST /api/v1/orders/{id}/ship ───────────────────────────────────────

    public function ship(ShipOrderRequest $request, int $id): JsonResponse
    {
        $order = $this->orderService->ship(
            $id,
            $request->input('carrier'),
            $request->input('tracking_number')
        );

        return $this->successResponse($order, 'Order shipped successfully');
    }

    // ─── POST /api/v1/orders/{id}/deliver ────────────────────────────────────

    public function deliver(int $id): JsonResponse
    {
        $order = DB::transaction(function () use ($id) {
            $order = Order::findOrFail($id);
            $order->addStatusHistory('delivered', 'Order marked as delivered', true);

            // Update shipment status if exists
            $order->shipment()?->update(['status' => 'delivered', 'delivered_at' => now()]);

            return $order;
        });

        return $this->successResponse($order, 'Order marked as delivered');
    }

    // ─── POST /api/v1/orders/{id}/complete ───────────────────────────────────

    public function complete(int $id): JsonResponse
    {
        $order = $this->orderService->complete($id);
        return $this->successResponse($order, 'Order completed successfully');
    }

    // ─── POST /api/v1/orders/{id}/cancel ─────────────────────────────────────

    public function cancel(Request $request, int $id): JsonResponse
    {
        $reason = $request->input('reason', 'Cancelled by admin');
        $order = DB::transaction(function () use ($id, $reason) {
            $order = Order::findOrFail($id);
            $order->addStatusHistory('cancelled', $reason, true);
            $order->update(['payment_status' => $order->payment_status === 'paid' ? 'refunded' : $order->payment_status]);
            return $order;
        });

        return $this->successResponse($order, 'Order cancelled successfully');
    }

    // ─── POST /api/v1/orders/{id}/refund ─────────────────────────────────────

    public function refund(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'amount'  => 'nullable|numeric|min:0.01',
            'reason'  => 'nullable|string|max:500',
            'partial' => 'boolean',
        ]);

        $order = Order::findOrFail($id);

        $refundAmount = $validated['amount'] ?? (float) $order->grand_total;
        $isPartial    = $validated['partial'] ?? ($refundAmount < (float) $order->grand_total);
        $reason       = $validated['reason'] ?? 'Refund processed';

        DB::transaction(function () use ($order, $refundAmount, $isPartial, $reason) {
            $status = $isPartial ? 'partially_refunded' : 'refunded';
            $order->addStatusHistory($isPartial ? 'processing' : 'refunded', "{$reason} (Amount: {$refundAmount})", true);
            $order->update(['payment_status' => $status]);
        });

        return $this->successResponse([
            'order_number'  => $order->order_number,
            'refund_amount' => $refundAmount,
            'is_partial'    => $isPartial,
        ], 'Refund processed successfully');
    }

    // ─── GET /api/v1/orders/{id}/tracking ────────────────────────────────────

    public function tracking(int $id): JsonResponse
    {
        $order = Order::with([
            'statusHistories.user',
            'shipment',
        ])->findOrFail($id);

        $timeline = $order->statusHistories->map(fn($h) => [
            'status'     => $h->status,
            'comment'    => $h->comment,
            'created_at' => $h->created_at?->toISOString(),
            'created_by' => $h->user?->name,
        ]);

        return $this->successResponse([
            'order_number'    => $order->order_number,
            'status'          => $order->status,
            'payment_status'  => $order->payment_status,
            'timeline'        => $timeline,
            'shipment'        => $order->shipment ? [
                'carrier'         => $order->shipment->carrier,
                'tracking_number' => $order->shipment->tracking_number,
                'status'          => $order->shipment->status,
                'shipped_at'      => $order->shipment->shipped_at?->toISOString(),
                'delivered_at'    => $order->shipment->delivered_at?->toISOString(),
            ] : null,
        ]);
    }

    // ─── GET /api/v1/orders/{id}/invoice ─────────────────────────────────────

    public function invoice(int $id): JsonResponse
    {
        $order = Order::with([
            'customer',
            'items.product',
            'items.variant',
            'shippingMethod',
            'statusHistories',
        ])->findOrFail($id);

        return $this->successResponse([
            'order_number'    => $order->order_number,
            'created_at'      => $order->created_at?->toISOString(),
            'status'          => $order->status,
            'payment_status'  => $order->payment_status,
            'customer'        => [
                'name'    => $order->customer?->name ?? $order->shipping_name,
                'email'   => $order->customer?->email,
                'phone'   => $order->shipping_phone,
                'address' => implode(', ', array_filter([
                    $order->shipping_address,
                    $order->shipping_city,
                    $order->shipping_province,
                    $order->shipping_country,
                    $order->shipping_postal_code,
                ])),
            ],
            'items'           => $order->items->map(fn($item) => [
                'name'        => $item->product_name,
                'sku'         => $item->product_sku,
                'quantity'    => (float) $item->quantity,
                'unit_price'  => (float) $item->unit_price,
                'total_price' => (float) ($item->total ?? $item->subtotal),
            ]),
            'subtotal'        => (float) $order->subtotal,
            'shipping_cost'   => (float) $order->shipping_cost,
            'discount_amount' => (float) $order->discount_amount,
            'tax_amount'      => (float) $order->tax_amount,
            'grand_total'     => (float) $order->grand_total,
            'currency_code'   => $order->currency_code,
            'coupon_code'     => $order->coupon_code,
            'customer_notes'  => $order->customer_notes,
        ]);
    }

    // ─── GET /api/v1/store/orders (my orders for authenticated customer) ─────

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

    // ─── GET /api/v1/store/orders/{number} ───────────────────────────────────

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
