<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Order\Order;
use App\Models\Sales\Sale;
use App\Services\OrderReturn\OrderReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderReturnController extends BaseApiController
{
    public function __construct(private readonly OrderReturnService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['company_id', 'status', 'type', 'fault', 'search']);
        $records = $this->service->getPaginated($filters, $request->get('per_page', 15));

        return $this->successResponse($records, 'Returns retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse($record, 'Return details retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        // 1. Resolve order_id or sale_id from order_number if provided
        if (!$request->filled('order_id') && !$request->filled('sale_id') && $request->filled('order_number')) {
            $orderNumber = trim((string)$request->input('order_number'));
            $foundOrder = Order::where('order_number', $orderNumber)->first();
            if ($foundOrder) {
                $request->merge(['order_id' => $foundOrder->id]);
            } else {
                $rawSaleId = preg_replace('/^POS-?/i', '', $orderNumber);
                $foundSale = Sale::where('invoice_number', $orderNumber)
                    ->orWhere('id', is_numeric($rawSaleId) ? (int)$rawSaleId : 0)
                    ->first();
                if ($foundSale) {
                    $request->merge(['sale_id' => $foundSale->id]);
                }
            }
        }

        // 2. Auto-populate all order/sale items if items array is omitted (default Full Return)
        if (empty($request->input('items'))) {
            if ($request->filled('order_id')) {
                /** @var Order|null $order */
                $order = Order::with('items')->where('id', $request->input('order_id'))->first();
                if ($order && $order->items->isNotEmpty()) {
                    $autoItems = $order->items->map(fn($item) => [
                        'order_item_id' => $item->id,
                        'quantity'      => (float) $item->quantity,
                    ])->toArray();
                    $request->merge(['items' => $autoItems]);
                }
            } elseif ($request->filled('sale_id')) {
                /** @var Sale|null $sale */
                $sale = Sale::with('items')->where('id', $request->input('sale_id'))->first();
                if ($sale && $sale->items->isNotEmpty()) {
                    $autoItems = $sale->items->map(fn($item) => [
                        'sale_item_id' => $item->id,
                        'quantity'     => (float) $item->quantity,
                    ])->toArray();
                    $request->merge(['items' => $autoItems]);
                }
            }
        }

        $data = $request->validate([
            'order_id'                  => 'nullable|exists:orders,id',
            'sale_id'                   => 'nullable|exists:sales,id',
            'warehouse_id'              => 'nullable|exists:warehouses,id',
            'type'                      => 'nullable|in:return,exchange',
            'channel'                   => 'nullable|string',
            'fault'                     => 'required|in:customer,store,courier',
            'reason_code'               => 'required|string',
            'reason_notes'              => 'nullable|string',
            'refund_method'             => 'nullable|string',
            'refund_account_info'       => 'nullable|array',
            'restocking_fee'            => 'nullable|numeric|min:0',
            'return_shipping_fee'       => 'nullable|numeric|min:0',
            'admin_notes'               => 'nullable|string',
            'items'                     => 'required|array|min:1',
            'items.*.order_item_id'     => 'nullable|exists:order_items,id',
            'items.*.sale_item_id'      => 'nullable|exists:sale_items,id',
            'items.*.quantity'          => 'required|numeric|min:0.0001',
            'items.*.sold_serial_number'=> 'nullable|string',
            'items.*.returned_serial_number' => 'nullable|string',
            'items.*.notes'             => 'nullable|string',
        ]);

        $record = $this->service->createReturn($data);
        return $this->successResponse($record, 'Return request created successfully', 201);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $record = $this->service->approveReturn($id, $request->input('admin_notes'));
        return $this->successResponse($record, 'Return approved successfully');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);
        $record = $this->service->rejectReturn($id, $request->input('reason'));
        return $this->successResponse($record, 'Return rejected successfully');
    }

    public function ship(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'shipping_method_id' => 'nullable|exists:shipping_methods,id',
            'carrier'            => 'nullable|string',
            'tracking_number'    => 'nullable|string',
            'pickup_type'        => 'nullable|string',
            'shipping_fee'       => 'nullable|numeric|min:0',
            'paid_by'            => 'nullable|in:customer,store,split',
            'notes'              => 'nullable|string',
        ]);

        $shipment = $this->service->recordShipment($id, $data);
        return $this->successResponse($shipment, 'Return shipment recorded successfully');
    }

    public function receive(Request $request, int $id): JsonResponse
    {
        $request->validate(['warehouse_id' => 'required|exists:warehouses,id']);
        $record = $this->service->receiveReturn($id, (int)$request->input('warehouse_id'), $request->input('notes'));
        return $this->successResponse($record, 'Return items received at warehouse holding');
    }

    public function inspect(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'warehouse_id'                           => 'nullable|exists:warehouses,id',
            'verdict'                                => 'required|in:pass,partial_pass,reject,fraud_suspected',
            'summary_notes'                          => 'nullable|string',
            'images'                                 => 'nullable|array',
            'items'                                  => 'required|array|min:1',
            'items.*.order_return_item_id'           => 'required|exists:order_return_items,id',
            'items.*.serial_matched'                 => 'nullable|boolean',
            'items.*.returned_serial_number'         => 'nullable|string',
            'items.*.accessories_checklist'          => 'nullable|array',
            'items.*.condition_grade'                => 'required|string',
            'items.*.deduction_amount'               => 'nullable|numeric|min:0',
            'items.*.inventory_action'               => 'required|string',
            'items.*.inspector_notes'                => 'nullable|string',
            'items.*.photos'                         => 'nullable|array',
        ]);

        $inspection = $this->service->completeInspection($id, $data);
        return $this->successResponse($inspection, 'QC Inspection completed and inventory updated');
    }

    public function settle(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'refund_method' => 'nullable|string|in:original_payment,store_credit,cash,bakong_khqr,bank_transfer',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);

        $record = $this->service->settleRefund($id, $data);
        return $this->successResponse($record, 'Refund settled successfully');
    }

    public function exchange(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'new_product_price'    => 'required|numeric|min:0',
            'new_product_tax'      => 'nullable|numeric|min:0',
            'exchange_fee'         => 'nullable|numeric|min:0',
            'replacement_shipping' => 'nullable|numeric|min:0',
            'payment_status'       => 'nullable|string',
            'notes'                => 'nullable|string',
        ]);

        $exchangeOrder = $this->service->processExchange($id, $data);
        return $this->successResponse($exchangeOrder, 'Exchange processed successfully');
    }
}
