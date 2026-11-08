<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Product\ProductVariant;
use App\Models\Inventory\Inventory;
use App\Models\Sales\Sale;
use App\Services\Sales\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MobileSyncController extends BaseApiController
{
    public function __construct(
        protected SaleService $saleService
    ) {}

    /**
     * GET /api/v1/mobile/sync/catalog
     * Incremental delta-sync for Flutter offline SQLite/Isar database
     */
    public function catalog(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id ?? 1;
        $branchId  = $user->branch_id ?? $request->integer('branch_id');
        $since     = $request->filled('since') ? Carbon::parse($request->input('since')) : null;

        $serverTimestamp = now()->toIso8601String();

        // 1. Products updated since timestamp
        $productQuery = Product::where('company_id', $companyId);
        if ($since) {
            $productQuery->where('updated_at', '>=', $since);
        } else {
            $productQuery->active();
        }

        $products = $productQuery->with(['primaryImage', 'unit:id,name,short_name', 'variants'])
            ->get()
            ->map(fn($p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'sku'           => $p->sku,
                'barcode'       => $p->barcode,
                'selling_price' => (float) $p->selling_price,
                'category_id'   => $p->category_id,
                'brand_id'      => $p->brand_id,
                'unit'          => $p->unit?->short_name ?? 'pcs',
                'is_active'     => (bool) $p->is_active,
                'image'         => $p->primaryImage?->image_url ?? $p->image_url,
                'updated_at'    => $p->updated_at?->toIso8601String(),
                'variants'      => $p->variants->map(fn($v) => [
                    'id'      => $v->id,
                    'name'    => $v->name,
                    'sku'     => $v->sku,
                    'barcode' => $v->barcode,
                    'price'   => (float) ($v->price ?? $p->selling_price),
                ]),
            ]);

        // 2. Branch Inventories
        $inventoryQuery = Inventory::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId));
        if ($since) {
            $inventoryQuery->where('updated_at', '>=', $since);
        }

        $inventories = $inventoryQuery->get(['id', 'product_id', 'product_variant_id', 'branch_id', 'quantity', 'updated_at']);

        // 3. Categories & Brands
        $categories = Category::where('company_id', $companyId)
            ->when($since, fn($q) => $q->where('updated_at', '>=', $since))
            ->get(['id', 'name', 'slug', 'image']);

        $brands = Brand::where('company_id', $companyId)
            ->when($since, fn($q) => $q->where('updated_at', '>=', $since))
            ->get(['id', 'name', 'slug', 'logo']);

        return $this->successResponse([
            'server_timestamp' => $serverTimestamp,
            'products'         => $products,
            'inventories'      => $inventories,
            'categories'       => $categories,
            'brands'           => $brands,
        ], 'Catalog sync payload retrieved');
    }

    /**
     * POST /api/v1/mobile/sync/offline-sales
     * Batch push of sales transacted locally while the mobile device was offline
     */
    public function pushOfflineSales(Request $request): JsonResponse
    {
        $request->validate([
            'sales'                     => 'required|array|min:1',
            'sales.*.client_uuid'       => 'required|string',
            'sales.*.subtotal'          => 'required|numeric|min:0',
            'sales.*.tax_amount'        => 'required|numeric|min:0',
            'sales.*.discount_amount'   => 'required|numeric|min:0',
            'sales.*.grand_total'       => 'required|numeric|min:0',
            'sales.*.paid_amount'       => 'required|numeric|min:0',
            'sales.*.items'             => 'required|array|min:1',
        ]);

        $user = $request->user();
        $companyId = $user->company_id ?? 1;
        $branchId  = $user->branch_id ?? $request->integer('branch_id');

        $synced = [];
        $errors = [];

        foreach ($request->input('sales') as $index => $salePayload) {
            $clientUuid = $salePayload['client_uuid'];

            // Idempotency check: don't process if this invoice or reference was already recorded
            $existing = Sale::where('company_id', $companyId)
                ->where(function ($q) use ($clientUuid, $salePayload) {
                    $q->where('invoice_number', $salePayload['invoice_number'] ?? '')
                      ->orWhere('notes', 'like', "%[OfflineRef:{$clientUuid}]%");
                })
                ->first();

            if ($existing) {
                $synced[] = [
                    'client_uuid'    => $clientUuid,
                    'invoice_number' => $existing->invoice_number,
                    'status'         => 'already_synced',
                ];
                continue;
            }

            try {
                $salePayload['company_id'] = $companyId;
                $salePayload['branch_id']  = $branchId;
                $salePayload['notes']      = ($salePayload['notes'] ?? '') . " [OfflineRef:{$clientUuid}]";

                $sale = $this->saleService->processSale($salePayload, $user);

                $synced[] = [
                    'client_uuid'    => $clientUuid,
                    'server_id'      => $sale->id,
                    'invoice_number' => $sale->invoice_number,
                    'status'         => 'synced',
                ];
            } catch (\Throwable $e) {
                $errors[] = [
                    'client_uuid' => $clientUuid,
                    'index'       => $index,
                    'error'       => $e->getMessage(),
                ];
            }
        }

        return $this->successResponse([
            'total_received' => count($request->input('sales')),
            'synced_count'   => count($synced),
            'synced'         => $synced,
            'errors'         => $errors,
        ], 'Offline sales batch processed');
    }
}
