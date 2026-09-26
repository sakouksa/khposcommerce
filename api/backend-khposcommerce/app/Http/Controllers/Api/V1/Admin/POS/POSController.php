<?php

namespace App\Http\Controllers\Api\V1\Admin\POS;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use App\Models\Sales\SaleReturn;
use App\Models\Sales\SaleReturnItem;
use App\Models\Product\Product;
use App\Models\Inventory\Inventory;
use App\Models\Inventory\InventoryMovement;
use App\Services\POS\VoiceSearchService;
use App\Services\POS\VisionSearchService;
use App\Services\Sales\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class POSController extends BaseApiController
{
    public function __construct(
        protected SaleService $saleService
    ) {}
    // ─── Generate a unique invoice number ────────────────────────────────────
    public function generateInvoiceNumber(string $prefix = 'INV-'): string
    {
        return $this->saleService->generateInvoiceNumber($prefix);
    }

    // ─── GET /api/v1/pos/sales ────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $sales = Sale::with(['customer:id,name,phone', 'cashier:id,name'])
            ->when($request->filled('date'), fn($q) => $q->whereDate('date', $request->date))
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->latest('date')
            ->paginate($request->integer('per_page', 15));

        return $this->paginatedResponse($sales);
    }

    // ─── GET /api/v1/pos/sales/{id} ───────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $sale = Sale::with([
            'customer:id,name,phone,email',
            'cashier:id,name',
            'items.product:id,name,sku',
            'items.variant:id,name,sku',
        ])->findOrFail($id);

        return $this->successResponse($sale);
    }

    // ─── GET /api/v1/pos/product-search ──────────────────────────────────────
    public function productSearch(Request $request): JsonResponse
    {
        $query       = $request->get('q', $request->get('search', ''));
        $warehouseId = $request->get('warehouse_id');
        $categoryId  = $request->get('category_id');

        $products = Product::with([
            'primaryImage',
            'images:id,product_id,image,is_primary',
            'category:id,name',
            'brand:id,name',
            'tax:id,name,rate,type',
            'variants:id,product_id,name,sku,barcode,selling_price,cost_price,image',
            'variants.inventories',
            'inventories',
        ])
        ->where('status', 'active')
        ->when(trim($query) !== '', function ($q) use ($query) {
            $q->search($query);
        })
        ->when($categoryId && $categoryId !== 'all', function ($q) use ($categoryId) {
            $q->where('category_id', $categoryId);
        })
        ->withSum('inventories as stock', 'quantity')
        ->limit(100)
        ->get();

        return $this->successResponse($products);
    }

    // ─── GET /api/v1/pos/products/barcode/{code} ─────────────────────────────
    public function barcodeLookup(Request $request, string $code): JsonResponse
    {
        $cleanCode = trim($code);
        if ($cleanCode === '') {
            return $this->errorResponse('Barcode code is required', null, 422);
        }

        $user = $request->user();
        $companyId = $user?->company_id ?? $request->integer('company_id', 1);
        $warehouseId = $request->integer('warehouse_id') ?: null;

        $query = Product::with([
            'primaryImage',
            'images:id,product_id,image,is_primary',
            'category:id,name',
            'brand:id,name',
            'tax:id,name,rate,type',
            'variants:id,product_id,name,sku,barcode,selling_price,cost_price,image',
            'variants.inventories',
            'inventories',
        ])
        ->where('status', 'active');

        if ($companyId) {
            $query->where('company_id', $companyId);
        }

        if ($warehouseId) {
            $query->whereHas('inventories', fn($iq) => $iq->where('warehouse_id', $warehouseId));
        }

        $matchingProducts = (clone $query)->where(function ($q) use ($cleanCode) {
            $q->where('barcode', $cleanCode)
              ->orWhere('sku', $cleanCode)
              ->orWhereHas('variants', fn($v) => $v->where('barcode', $cleanCode)->orWhere('sku', $cleanCode));
        })
        ->withSum('inventories as stock', 'quantity')
        ->get();

        if ($matchingProducts->isEmpty()) {
            // Check without warehouse restriction or partial match
            $fallback = Product::with([
                'primaryImage',
                'category:id,name',
                'brand:id,name',
                'tax:id,name,rate,type',
                'variants',
                'inventories',
            ])
            ->where('status', 'active')
            ->where('company_id', $companyId)
            ->where(function ($q) use ($cleanCode) {
                $q->where('barcode', $cleanCode)
                  ->orWhere('sku', $cleanCode)
                  ->orWhere('barcode', 'LIKE', "%{$cleanCode}%")
                  ->orWhere('sku', 'LIKE', "%{$cleanCode}%")
                  ->orWhereHas('variants', fn($v) => 
                      $v->where('barcode', $cleanCode)
                        ->orWhere('sku', $cleanCode)
                        ->orWhere('barcode', 'LIKE', "%{$cleanCode}%")
                        ->orWhere('sku', 'LIKE', "%{$cleanCode}%")
                  );
            })
            ->withSum('inventories as stock', 'quantity')
            ->get();

            if ($fallback->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Barcode not found in your inventory.',
                    'code'    => $cleanCode,
                ], 404);
            }
            $matchingProducts = $fallback;
        }

        if ($matchingProducts->count() > 1) {
            return response()->json([
                'success'  => true,
                'multiple' => true,
                'message'  => 'Multiple products match this barcode.',
                'products' => $matchingProducts,
                'total'    => $matchingProducts->count(),
            ]);
        }

        $product = $matchingProducts->first();
        return response()->json([
            'success'  => true,
            'multiple' => false,
            'product'  => $product,
            'products' => [$product],
            'total'    => 1,
        ]);
    }

    // ─── POST /api/v1/pos/voice-search ───────────────────────────────────────
    public function voiceSearch(Request $request, VoiceSearchService $voiceService): JsonResponse
    {
        $request->validate([
            'transcript'   => 'required|string|max:500',
            'language'     => 'nullable|string|in:km,en,zh,th,vi,auto',
            'warehouse_id' => 'nullable|integer',
            'branch_id'    => 'nullable|integer',
            'company_id'   => 'nullable|integer',
        ]);

        $user = $request->user();
        $context = [
            'company_id'   => $user?->company_id ?? $request->integer('company_id', 1),
            'warehouse_id' => $request->integer('warehouse_id') ?: null,
            'branch_id'    => $request->integer('branch_id') ?: null,
        ];

        $lang = $request->get('language');
        if ($lang === 'auto') {
            $lang = null;
        }

        $result = $voiceService->search(
            transcript: $request->input('transcript'),
            requestedLang: $lang,
            user: $user,
            context: $context
        );

        return response()->json($result);
    }

    // ─── POST /api/v1/pos/vision-search ──────────────────────────────────────
    public function visionSearch(Request $request, VisionSearchService $visionService): JsonResponse
    {
        $request->validate([
            'image'           => 'nullable|string',
            'ocr_hint'        => 'nullable|string|max:255',
            'visual_category' => 'nullable|string|max:100',
            'category_hint'   => 'nullable|string|max:100',
            'language'        => 'nullable|string|in:km,en,zh,th,vi,auto',
            'warehouse_id'    => 'nullable|integer',
            'branch_id'       => 'nullable|integer',
            'company_id'      => 'nullable|integer',
        ]);

        $user = $request->user();
        $context = [
            'company_id'   => $user?->company_id ?? $request->integer('company_id', 1),
            'warehouse_id' => $request->integer('warehouse_id') ?: null,
            'branch_id'    => $request->integer('branch_id') ?: null,
        ];

        $lang = $request->get('language', 'km');
        if ($lang === 'auto') {
            $lang = 'km';
        }

        $visualCat = $request->input('visual_category') ?? $request->input('category_hint');

        $result = $visionService->search(
            imageFrame: $request->input('image'),
            ocrHint: $request->input('ocr_hint'),
            language: $lang,
            context: $context,
            visualCategory: $visualCat
        );

        return response()->json($result);
    }

    // ─── POST /api/v1/pos/apply-coupon ───────────────────────────────────────
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'   => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $code   = strtoupper(trim($request->code));
        $amount = (float) $request->amount;

        // Look up in marketing coupons table if it exists
        $couponTable = DB::getSchemaBuilder()->hasTable('coupons');
        if ($couponTable) {
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

        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired coupon code.',
        ], 422);
    }

    // ─── POST /api/v1/pos/sales ───────────────────────────────────────────────
    public function sale(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id'      => 'nullable|exists:companies,id',
            'branch_id'       => 'nullable|exists:branches,id',
            'store_id'        => 'nullable|exists:stores,id',
            'warehouse_id'    => 'nullable|exists:warehouses,id',
            'customer_id'     => 'nullable|exists:customers,id',
            'invoice_number'  => 'nullable|string|unique:sales,invoice_number',
            'subtotal'        => 'required|numeric|min:0',
            'tax_amount'      => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'grand_total'     => 'required|numeric|min:0',
            'paid_amount'     => 'required|numeric|min:0',
            'change_amount'   => 'required|numeric|min:0',
            'payment_method'  => 'nullable|string',
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

        try {
            $sale = $this->saleService->processSale($data, $request->user());

            // ── Record POS Sale Audit Log ──────────────────────────────────
            if (class_exists(\App\Models\Log\AuditLog::class)) {
                try {
                    \App\Models\Log\AuditLog::create([
                        'company_id'     => $sale->company_id,
                        'user_id'        => $request->user()?->id,
                        'event'          => 'POS_SALE_CREATED',
                        'auditable_type' => 'Sale',
                        'auditable_id'   => $sale->id,
                        'new_values'     => [
                            'invoice_number'  => $sale->invoice_number,
                            'grand_total'     => $sale->grand_total,
                            'paid_amount'     => $sale->paid_amount,
                            'payment_method'  => $sale->payment_method,
                            'item_count'      => count($data['items']),
                            'description'     => "POS Sale created: {$sale->invoice_number} for \${$sale->grand_total}",
                        ],
                        'ip_address'     => $request->ip(),
                        'user_agent'     => $request->userAgent(),
                    ]);
                } catch (\Throwable $logEx) {
                    \Illuminate\Support\Facades\Log::warning('POS Sale AuditLog failed: ' . $logEx->getMessage());
                }
            }

            return $this->successResponse(
                $sale->load(['items.product:id,name,sku', 'customer:id,name', 'cashier:id,name']),
                'POS Transaction completed successfully',
                201
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), $e->errors(), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to process POS sale: ' . $e->getMessage(), null, 500);
        }
    }

    // ─── POST /api/v1/pos/sales/{id}/return ──────────────────────────────────
    public function processReturn(Request $request, int $id): JsonResponse
    {
        $sale = Sale::with('items')->findOrFail($id);

        if (!$request->has('items') || empty($request->input('items'))) {
            $defaultItems = [];
            foreach ($sale->items as $item) {
                $defaultItems[] = [
                    'sale_item_id'       => $item->id,
                    'product_id'         => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'quantity'           => (float) $item->quantity,
                ];
            }
            $request->merge(['items' => $defaultItems]);
        }

        $data = $request->validate([
            'reason'        => 'nullable|string',
            'refund_method' => 'nullable|string|in:cash,store_credit,original_payment',
            'items'         => 'required|array|min:1',
            'items.*.sale_item_id'       => 'required|exists:sale_items,id',
            'items.*.product_id'         => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity'           => 'required|numeric|min:0.0001',
        ]);

        $saleReturn = DB::transaction(function () use ($id, $data) {
            $sale     = Sale::with('items')->findOrFail($id);
            $authUser = auth()->user();

            $refNumber = 'RET-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
            $totalRefund = 0;

            $saleReturn = SaleReturn::create([
                'company_id'       => $sale->company_id,
                'sale_id'          => $sale->id,
                'user_id'          => $authUser?->id,
                'reference_number' => $refNumber,
                'date'             => now(),
                'refund_method'    => $data['refund_method'] ?? 'cash',
                'reason'           => $data['reason'] ?? null,
                'status'           => 'approved',
            ]);

            foreach ($data['items'] as $item) {
                $saleItem = SaleItem::findOrFail($item['sale_item_id']);
                $qty      = (float) $item['quantity'];
                $unitPrice = (float) $saleItem->unit_price;
                $lineTotal = round($qty * $unitPrice, 2);
                $totalRefund += $lineTotal;

                SaleReturnItem::create([
                    'sale_return_id'     => $saleReturn->id,
                    'sale_item_id'       => $saleItem->id,
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'quantity'           => $qty,
                    'unit_price'         => $unitPrice,
                    'total'              => $lineTotal,
                ]);

                // ── Restore inventory stock ──────────────────────────────
                $product = Product::find($item['product_id']);
                if ($product && $product->track_inventory) {
                    $inventory = Inventory::where('warehouse_id', $sale->warehouse_id)
                        ->where('product_id', $product->id)
                        ->when($item['product_variant_id'] ?? null, fn($q) => $q->where('product_variant_id', $item['product_variant_id']))
                        ->first();

                    $qtyBefore = $inventory ? (float) $inventory->quantity : 0;

                    if ($inventory) {
                        $inventory->increment('quantity', $qty);
                    } else {
                        Inventory::create([
                            'company_id'         => $sale->company_id,
                            'warehouse_id'       => $sale->warehouse_id,
                            'product_id'         => $product->id,
                            'product_variant_id' => $item['product_variant_id'] ?? null,
                            'quantity'           => $qty,
                        ]);
                    }

                    // ── Inventory movement for return ────────────────────
                    InventoryMovement::create([
                        'company_id'         => $sale->company_id,
                        'warehouse_id'       => $sale->warehouse_id,
                        'product_id'         => $product->id,
                        'product_variant_id' => $item['product_variant_id'] ?? null,
                        'user_id'            => $authUser?->id,
                        'reference_type'     => 'sale_return',
                        'reference_id'       => $saleReturn->id,
                        'type'               => 'in',
                        'quantity'           => $qty,
                        'quantity_before'    => $qtyBefore,
                        'quantity_after'     => $qtyBefore + $qty,
                        'unit_cost'          => $unitPrice,
                        'notes'              => "Sale Return: {$refNumber}",
                    ]);

                    // Decrement sold_count
                    $product->decrement('sold_count', (int) $qty);
                }
            }

            $saleReturn->update([
                'total_amount'  => $totalRefund,
                'refund_amount' => $totalRefund,
            ]);

            // Mark original sale as refunded
            $sale->update(['status' => 'refunded']);

            // ── Record Return Audit Log ───────────────────────────────────
            if (class_exists(\App\Models\Log\AuditLog::class)) {
                try {
                    \App\Models\Log\AuditLog::create([
                        'company_id'     => $sale->company_id,
                        'user_id'        => $authUser?->id,
                        'event'          => 'POS_SALE_REFUNDED',
                        'auditable_type' => 'SaleReturn',
                        'auditable_id'   => $saleReturn->id,
                        'new_values'     => [
                            'sale_id'          => $sale->id,
                            'invoice_number'   => $sale->invoice_number,
                            'reference_number' => $refNumber,
                            'refund_amount'    => $totalRefund,
                            'refund_method'    => $saleReturn->refund_method,
                            'description'      => "POS Refund processed for {$sale->invoice_number} amount \${$totalRefund}",
                        ],
                        'ip_address'     => request()->ip(),
                        'user_agent'     => request()->userAgent(),
                    ]);
                } catch (\Throwable $logEx) {
                    \Illuminate\Support\Facades\Log::warning('POS Refund AuditLog failed: ' . $logEx->getMessage());
                }
            }

            return $saleReturn;
        });

        return $this->successResponse($saleReturn->load('items'), 'Sale return processed successfully', 201);
    }
}
