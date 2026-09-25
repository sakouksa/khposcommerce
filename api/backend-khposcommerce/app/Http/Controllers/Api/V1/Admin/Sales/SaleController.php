<?php

namespace App\Http\Controllers\Api\V1\Admin\Sales;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Sales\Sale;
use App\Services\Sales\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SaleController extends BaseApiController
{
    public function __construct(
        protected SaleService $saleService
    ) {}

    /**
     * GET /api/v1/sales
     */
    public function index(Request $request): JsonResponse
    {
        $sales = Sale::with([
                'customer:id,name,phone,email,photo',
                'cashier:id,name,avatar',
                'company:id,name,email,phone,address,logo,tax_number',
                'branch:id,name,code,phone,address',
                'store:id,name,slug,phone,address,logo',
                'items:id,sale_id,product_id,product_name,sku,quantity,total,unit_price,subtotal,discount_amount,tax_amount',
                'items.product.primaryImage',
                'items.variant:id,product_id,name,sku,image',
                'paymentMethod:id,name,code',
            ])
            ->when($request->search, function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('invoice_number', 'like', "%{$v}%")
                        ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$v}%")->orWhere('phone', 'like', "%{$v}%"));
                });
            })
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->payment_status, fn($q, $v) => $q->where('payment_status', $v))
            ->when($request->payment_method, fn($q, $v) => $q->where('payment_method', $v))
            ->when($request->date_from ?? $request->start_date, fn($q, $v) => $q->where('date', '>=', str_contains($v, ' ') ? $v : "{$v} 00:00:00"))
            ->when($request->date_to ?? $request->end_date, fn($q, $v) => $q->where('date', '<=', str_contains($v, ' ') ? $v : "{$v} 23:59:59"))
            ->when($request->min_total, fn($q, $v) => $q->where('grand_total', '>=', (float) $v))
            ->when($request->max_total, fn($q, $v) => $q->where('grand_total', '<=', (float) $v))
            ->latest('id')
            ->paginate($request->integer('per_page', 12));

        return $this->paginatedResponse($sales);
    }

    /**
     * POST /api/v1/sales - Process POS Checkout & Create Sale Invoice
     */
    public function store(Request $request): JsonResponse
    {
        $subtotalInput = $request->input('subtotal') ?? $request->input('sub_total');
        $taxInput = $request->input('tax_amount') ?? $request->input('vat_amount') ?? 0;
        $totalInput = $request->input('grand_total') ?? $request->input('total_amount');

        $request->merge([
            'subtotal'    => $subtotalInput,
            'tax_amount'  => $taxInput,
            'grand_total' => $totalInput,
        ]);

        $validated = $request->validate([
            'customer_id'                => 'nullable|integer',
            'warehouse_id'               => 'nullable|integer',
            'branch_id'                  => 'nullable|integer',
            'store_id'                   => 'nullable|integer',
            'payment_status'             => 'nullable|string',
            'payment_method'             => 'nullable|string',
            'payment_details'            => 'nullable|array',
            'coupon_code'                => 'nullable|string',
            'subtotal'                   => 'required|numeric|min:0',
            'discount_amount'            => 'nullable|numeric|min:0',
            'tax_amount'                 => 'nullable|numeric|min:0',
            'grand_total'                => 'required|numeric|min:0',
            'paid_amount'                => 'nullable|numeric|min:0',
            'change_amount'              => 'nullable|numeric|min:0',
            'notes'                      => 'nullable|string',
            'items'                      => 'required|array|min:1',
            'items.*.product_id'         => 'required|integer',
            'items.*.product_variant_id' => 'nullable|integer',
            'items.*.quantity'           => 'nullable|numeric|min:0.01',
            'items.*.qty'                => 'nullable|numeric|min:0.01',
            'items.*.unit_price'         => 'nullable|numeric|min:0',
            'items.*.price'              => 'nullable|numeric|min:0',
            'items.*.cost_price'         => 'nullable|numeric|min:0',
            'items.*.discount_amount'    => 'nullable|numeric|min:0',
            'items.*.tax_percent'        => 'nullable|numeric|min:0',
            'items.*.tax_amount'         => 'nullable|numeric|min:0',
            'items.*.total'              => 'nullable|numeric|min:0',
        ]);

        try {
            $sale = $this->saleService->processSale($validated, $request->user());

            return $this->successResponse([
                'reference_no' => $sale->invoice_number,
                'sale'         => $sale,
            ], 'Sale processed successfully.', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), $e->errors(), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to process sale: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * GET /api/v1/sales/{id}
     */
    public function show(int $id): JsonResponse
    {
        $sale = Sale::with([
            'customer.addresses',
            'customer.group',
            'cashier.employee',
            'items.product.primaryImage',
            'items.product.category',
            'items.variant',
            'company',
            'branch',
            'store',
            'warehouse',
            'paymentMethod',
            'returns.items',
        ])->findOrFail($id);

        $posSettings = \App\Models\Setting\Setting::where('group', 'pos')
            ->pluck('value', 'key');

        $sale->setAttribute('receipt_header', $posSettings['pos_receipt_header'] ?? null);
        $sale->setAttribute('receipt_footer', $posSettings['pos_receipt_footer'] ?? null);
        $sale->setAttribute('return_policy', $posSettings['pos_return_policy'] ?? null);

        return $this->successResponse($sale);
    }

    /**
     * DELETE /api/v1/sales/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $sale = Sale::findOrFail($id);
        $sale->delete();
        return $this->successResponse(null, 'Sale invoice deleted successfully.');
    }
}
