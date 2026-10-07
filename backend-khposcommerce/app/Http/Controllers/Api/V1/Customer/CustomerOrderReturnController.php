<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Customer\Customer;
use App\Models\Order\Order;
use App\Models\Order\OrderItem;
use App\Models\Order\OrderReturn;
use App\Services\OrderReturn\OrderReturnService;
use App\Services\OrderReturn\ReturnPolicyEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderReturnController extends BaseApiController
{
    public function __construct(
        private readonly OrderReturnService $returnService,
        private readonly ReturnPolicyEngineService $policyEngine
    ) {
    }

    /**
     * Get all returns belonging to authenticated customer.
     */
    public function myReturns(Request $request): JsonResponse
    {
        $customer = Customer::where('user_id', $request->user()->id)->first();
        if (!$customer) {
            return $this->successResponse([]);
        }

        $returns = OrderReturn::where('customer_id', $customer->id)
            ->with(['items.product.primaryImage', 'items.product.images', 'latestShipment', 'latestInspection'])
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return $this->paginatedResponse($returns);
    }

    /**
     * Check return eligibility for an order item.
     */
    public function checkEligibility(Request $request, int $orderId, int $orderItemId): JsonResponse
    {
        $customer = Customer::where('user_id', $request->user()->id)->first();
        $order = Order::where('id', $orderId)
            ->when($customer, fn($q) => $q->where('customer_id', $customer->id))
            ->firstOrFail();

        $item = OrderItem::where('order_id', $order->id)->where('id', $orderItemId)->firstOrFail();

        $result = $this->policyEngine->evaluateEligibility($order, $item);

        return $this->successResponse($result, 'Eligibility evaluated successfully');
    }

    /**
     * Submit customer return/exchange request.
     */
    public function requestReturn(Request $request): JsonResponse
    {
        $customer = Customer::where('user_id', $request->user()->id)->first();
        if (!$customer) {
            return $this->errorResponse('Customer profile not found', null, 404);
        }

        $data = $request->validate([
            'order_id'            => 'required|exists:orders,id',
            'type'                => 'nullable|in:return,exchange',
            'reason_code'         => 'required|string',
            'reason_notes'        => 'nullable|string',
            'refund_method'       => 'nullable|string',
            'refund_account_info' => 'nullable|array',
            'items'               => 'required|array|min:1',
            'items.*.order_item_id' => 'required|exists:order_items,id',
            'items.*.quantity'    => 'required|numeric|min:0.0001',
            'items.*.notes'       => 'nullable|string',
        ]);

        // Ensure order belongs to customer
        $order = Order::where('id', $data['order_id'])->where('customer_id', $customer->id)->firstOrFail();

        $data['customer_id'] = $customer->id;
        $data['channel'] = 'web';
        $data['fault'] = in_array($data['reason_code'], ['wrong_item_sent', 'defective', 'damaged_in_transit']) ? 'store' : 'customer';

        $orderReturn = $this->returnService->createReturn($data);

        return $this->successResponse($orderReturn, 'Return request submitted successfully. Our team will review it shortly.', 201);
    }

    /**
     * Get details of a single return by return number.
     */
    public function returnDetails(Request $request, string $returnNumber): JsonResponse
    {
        $customer = Customer::where('user_id', $request->user()->id)->first();

        $return = OrderReturn::where('return_number', $returnNumber)
            ->when($customer, fn($q) => $q->where('customer_id', $customer->id))
            ->with(['order.items', 'items.product', 'latestShipment', 'latestInspection'])
            ->firstOrFail();

        return $this->successResponse($return, 'Return details retrieved successfully');
    }
}
