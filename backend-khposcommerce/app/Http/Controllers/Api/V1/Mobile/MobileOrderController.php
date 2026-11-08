<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Order\Order;
use App\Models\Customer\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileOrderController extends BaseApiController
{
    /**
     * GET /api/v1/mobile/orders
     * List branch orders (POS orders, click-and-collect, customer delivery orders)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id ?? 1;
        $branchId  = $user->branch_id ?? $request->integer('branch_id');

        $orders = Order::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = trim($request->search);
                $q->where(fn($sub) => $sub->where('order_number', 'like', "%{$term}%")
                    ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$term}%")->orWhere('phone', 'like', "%{$term}%")));
            })
            ->with(['customer:id,name,phone', 'items.product:id,name,sku'])
            ->latest('id')
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($orders);
    }

    /**
     * GET /api/v1/mobile/orders/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id ?? 1;

        $order = Order::where('company_id', $companyId)
            ->with([
                'customer:id,name,phone,email,address',
                'branch:id,name,phone',
                'items.product:id,name,sku,barcode',
                'items.variant:id,name,sku',
                'shippingAddress',
                'payments',
            ])
            ->findOrFail($id);

        return $this->successResponse($order);
    }

    /**
     * PUT /api/v1/mobile/orders/{id}/status
     * Fast mobile order status update (e.g. Ready for Pickup, Delivered)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,processing,confirmed,ready_for_pickup,shipped,delivered,completed,cancelled',
            'notes'  => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $companyId = $user->company_id ?? 1;

        $order = Order::where('company_id', $companyId)->findOrFail($id);
        $order->status = $request->input('status');
        if ($request->filled('notes')) {
            $order->notes = ($order->notes ? $order->notes . "\n" : '') . "[" . now()->format('Y-m-d H:i') . " {$user->name}] " . $request->notes;
        }
        $order->save();

        return $this->successResponse($order, 'Order status updated successfully');
    }

    /**
     * GET /api/v1/mobile/customers
     * Quick customer lookup by phone or name at POS counter
     */
    public function customers(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        $term = trim($request->get('search', $request->get('q', '')));

        $customers = Customer::where('company_id', $companyId)
            ->when(!empty($term), function ($q) use ($term) {
                $q->where(fn($sub) => $sub->where('name', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%"));
            })
            ->select(['id', 'name', 'phone', 'email', 'code', 'points_balance', 'credit_balance'])
            ->limit(25)
            ->get();

        return $this->successResponse($customers);
    }
}
