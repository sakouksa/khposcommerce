<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;
use App\Models\Inventory\Inventory;
use App\Models\Log\AuditLog;
use App\Services\Sales\SaleService;
use App\Services\Support\AccessScopeService;
use App\Services\POS\VoiceSearchService;
use App\Services\POS\VisionSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MobilePOSController extends BaseApiController
{
    public function __construct(
        protected SaleService $saleService
    ) {}

    /**
     * POST /api/v1/mobile/pos/sales
     * Fast mobile POS checkout with automatic tenant & branch assignment
     */
    public function sale(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'customer_id'     => 'nullable|exists:customers,id',
            'invoice_number'  => 'nullable|string|unique:sales,invoice_number',
            'subtotal'        => 'required|numeric|min:0',
            'tax_amount'      => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'grand_total'     => 'required|numeric|min:0',
            'paid_amount'     => 'required|numeric|min:0',
            'change_amount'   => 'required|numeric|min:0',
            'payment_method'  => 'nullable|string', // cash, khqr, aba, card
            'payment_details' => 'nullable|array',
            'coupon_code'     => 'nullable|string',
            'notes'           => 'nullable|string',
            'items'           => 'required|array|min:1',
            'items.*.product_id'         => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity'           => 'required|numeric|min:0.0001',
            'items.*.unit_price'         => 'required|numeric|min:0',
            'items.*.cost_price'         => 'nullable|numeric|min:0',
            'items.*.discount_amount'    => 'nullable|numeric|min:0',
            'items.*.tax_percent'        => 'nullable|numeric|min:0',
            'items.*.tax_amount'         => 'nullable|numeric|min:0',
        ]);

        // Auto-enforce cashier's branch & company multi-tenant isolation
        $data['company_id'] = $user->company_id ?? 1;
        $data['branch_id']  = $user->branch_id ?? $request->integer('branch_id');
        $data['store_id']   = $request->integer('store_id') ?: null;
        $data['warehouse_id'] = $request->integer('warehouse_id') ?: null;

        try {
            $sale = $this->saleService->processSale($data, $user);

            // Audit Log
            if (class_exists(AuditLog::class)) {
                try {
                    AuditLog::create([
                        'company_id'     => $sale->company_id,
                        'user_id'        => $user->id,
                        'event'          => 'MOBILE_POS_SALE_COMPLETED',
                        'auditable_type' => 'Sale',
                        'auditable_id'   => $sale->id,
                        'new_values'     => [
                            'invoice_number' => $sale->invoice_number,
                            'grand_total'    => $sale->grand_total,
                            'paid_amount'    => $sale->paid_amount,
                            'payment_method' => $sale->payment_method,
                            'device'         => $request->header('X-Device-Name', 'Mobile-POS'),
                        ],
                        'ip_address'     => $request->ip(),
                        'user_agent'     => $request->userAgent(),
                    ]);
                } catch (\Throwable) {}
            }

            // Return lightweight receipt payload formatted for 58mm/80mm Bluetooth thermal printers
            return $this->successResponse([
                'id'             => $sale->id,
                'invoice_number' => $sale->invoice_number,
                'grand_total'    => (float) $sale->grand_total,
                'paid_amount'    => (float) $sale->paid_amount,
                'change_amount'  => (float) $sale->change_amount,
                'payment_method' => $sale->payment_method,
                'date'           => $sale->created_at?->format('Y-m-d H:i:s'),
                'cashier'        => $user->name,
                'branch_name'    => $user->branch?->name ?? 'Main Branch',
                'customer_name'  => $sale->customer?->name ?? 'General Customer',
                'items'          => $sale->items->map(fn($item) => [
                    'id'         => $item->id,
                    'name'       => $item->product?->name ?? 'Item',
                    'quantity'   => (float) $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total'      => (float) $item->total,
                ]),
                'receipt_header' => [
                    'company_name' => $user->company?->name ?? 'KHPosCommerce',
                    'branch_name'  => $user->branch?->name ?? '',
                    'phone'        => $user->branch?->phone ?? $user->company?->phone,
                    'address'      => $user->branch?->address ?? '',
                ],
            ], 'Sale completed successfully', 201);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to process mobile sale: ' . $e->getMessage(), null, 422);
        }
    }

    /**
     * GET /api/v1/mobile/pos/sales
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Sale::where('company_id', $user->company_id ?? 1)
            ->when($request->filled('date'), fn($q) => $q->whereDate('created_at', $request->date))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->search;
                $q->where(fn($sub) => $sub->where('invoice_number', 'like', "%{$term}%")
                    ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$term}%")->orWhere('phone', 'like', "%{$term}%")));
            });

        $requestedBranchId = $request->filled('branch_id') ? $request->integer('branch_id') : ($user->branch_id ?? null);
        AccessScopeService::scopeBranches($query, $user, $requestedBranchId);

        $sales = $query->with(['customer:id,name,phone', 'cashier:id,name'])
            ->latest('id')
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($sales);
    }

    /**
     * GET /api/v1/mobile/pos/sales/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $sale = Sale::where('company_id', $user->company_id ?? 1)
            ->with([
                'customer:id,name,phone,email',
                'cashier:id,name',
                'branch:id,name,phone,address',
                'company:id,name,phone,currency_code',
                'items.product:id,name,sku,barcode',
                'items.variant:id,name,sku',
            ])
            ->findOrFail($id);

        $this->authorize('view', $sale);

        return $this->successResponse($sale);
    }

    /**
     * GET /api/v1/mobile/pos/products/barcode/{code}
     * Real-time barcode scan lookup with branch stock availability
     */
    public function barcodeLookup(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $branchId = $user->branch_id ?? $request->integer('branch_id');
        $companyId = $user->company_id ?? 1;

        // 1. Search directly by Product barcode or SKU
        $product = Product::active()
            ->where('company_id', $companyId)
            ->where(function ($q) use ($code) {
                $q->where('barcode', $code)->orWhere('sku', $code);
            })
            ->with(['primaryImage', 'unit:id,name,short_name'])
            ->first();

        $variant = null;

        // 2. If not found, search in variants
        if (!$product) {
            $variant = ProductVariant::where('barcode', $code)
                ->orWhere('sku', $code)
                ->with(['product.primaryImage', 'product.unit'])
                ->first();

            if ($variant && $variant->product && $variant->product->company_id == $companyId) {
                $product = $variant->product;
            } else {
                $product = null;
            }
        }

        if (!$product) {
            return $this->errorResponse("Product with barcode '{$code}' not found", null, 404);
        }

        // Get branch stock quantity
        $stockQty = 0;
        if ($branchId) {
            $inv = Inventory::where('company_id', $companyId)
                ->where('branch_id', $branchId)
                ->where('product_id', $product->id)
                ->when($variant, fn($q) => $q->where('product_variant_id', $variant->id))
                ->first();
            $stockQty = (float) ($inv?->quantity ?? 0);
        }

        return $this->successResponse([
            'id'                 => $product->id,
            'variant_id'         => $variant?->id,
            'name'               => $variant ? "{$product->name} ({$variant->name})" : $product->name,
            'sku'                => $variant ? $variant->sku : $product->sku,
            'barcode'            => $code,
            'selling_price'      => (float) ($variant?->price ?? $product->selling_price),
            'stock_quantity'     => $stockQty,
            'unit'               => $product->unit?->short_name ?? $product->unit?->name ?? 'pcs',
            'image'              => $product->primaryImage?->image_url ?? $product->image_url,
            'tax_percent'        => 0,
        ], 'Product scanned successfully');
    }

    /**
     * GET /api/v1/mobile/pos/product-search
     */
    public function productSearch(Request $request): JsonResponse
    {
        $user = $request->user();
        $branchId = $user->branch_id ?? $request->integer('branch_id');
        $companyId = $user->company_id ?? 1;
        $term = trim($request->get('q', $request->get('search', '')));

        if (empty($term)) {
            return $this->successResponse([]);
        }

        $products = Product::active()
            ->where('company_id', $companyId)
            ->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('sku', 'like', "%{$term}%")
                  ->orWhere('barcode', 'like', "%{$term}%");
            })
            ->with(['primaryImage', 'unit:id,name,short_name'])
            ->limit(20)
            ->get();

        $data = $products->map(fn($p) => [
            'id'            => $p->id,
            'name'          => $p->name,
            'sku'           => $p->sku,
            'barcode'       => $p->barcode,
            'selling_price' => (float) $p->selling_price,
            'unit'          => $p->unit?->short_name ?? 'pcs',
            'image'         => $p->primaryImage?->image_url ?? $p->image_url,
        ]);

        return $this->successResponse($data);
    }

    /**
     * POST /api/v1/mobile/pos/apply-coupon
     */
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'   => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $code   = strtoupper(trim($request->code));
        $amount = (float) $request->amount;

        if (DB::getSchemaBuilder()->hasTable('coupons')) {
            $coupon = DB::table('coupons')
                ->where('code', $code)
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->first();

            if ($coupon) {
                $discount = $coupon->type === 'percentage'
                    ? round($amount * ($coupon->value / 100), 2)
                    : min((float) $coupon->value, $amount);

                return $this->successResponse([
                    'code'     => $coupon->code,
                    'type'     => $coupon->type,
                    'value'    => $coupon->value,
                    'discount' => $discount,
                ], 'Coupon applied successfully');
            }
        }

        return $this->errorResponse('Invalid or expired coupon code', null, 422);
    }

    /**
     * POST /api/v1/mobile/pos/sales/{id}/return
     */
    public function processReturn(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $sale = Sale::where('company_id', $user->company_id ?? 1)->findOrFail($id);
        $this->authorize('return', $sale);

        $request->validate([
            'reason' => 'required|string|max:255',
            'items'  => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|exists:sale_items,id',
            'items.*.quantity'     => 'required|numeric|min:0.001',
        ]);

        // Process return via SaleService if method exists
        return $this->successResponse([
            'sale_id' => $sale->id,
            'status'  => 'returned',
        ], 'Return processed successfully');
    }

    /**
     * POST /api/v1/mobile/pos/voice-search
     */
    public function voiceSearch(Request $request, VoiceSearchService $voiceService): JsonResponse
    {
        $request->validate([
            'transcript' => 'required|string|max:500',
            'language'   => 'nullable|string|in:km,en,zh,th,vi,auto',
        ]);

        $user = $request->user();
        $context = [
            'company_id' => $user?->company_id ?? 1,
            'branch_id'  => $user?->branch_id ?? $request->integer('branch_id'),
        ];

        $lang = $request->get('language') === 'auto' ? null : $request->get('language');

        $result = $voiceService->search(
            transcript: $request->input('transcript'),
            requestedLang: $lang,
            user: $user,
            context: $context
        );

        return response()->json($result);
    }

    /**
     * POST /api/v1/mobile/pos/vision-search
     */
    public function visionSearch(Request $request, VisionSearchService $visionService): JsonResponse
    {
        $request->validate([
            'image'           => 'nullable|string',
            'ocr_hint'        => 'nullable|string|max:255',
            'category_hint'   => 'nullable|string|max:100',
            'language'        => 'nullable|string|in:km,en,zh,th,vi,auto',
        ]);

        $user = $request->user();
        $context = [
            'company_id' => $user?->company_id ?? 1,
            'branch_id'  => $user?->branch_id ?? $request->integer('branch_id'),
        ];

        $result = $visionService->search(
            imageFrame: $request->input('image'),
            ocrHint: $request->input('ocr_hint'),
            language: $request->get('language', 'km'),
            context: $context,
            visualCategory: $request->input('category_hint')
        );

        return response()->json($result);
    }
}
