<?php

namespace App\Http\Controllers\Api\V1\Mobile;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Inventory\Inventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileProductController extends BaseApiController
{
    /**
     * GET /api/v1/mobile/products
     * Lightweight product catalog tailored for fast touch grid on mobile devices
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id ?? 1;
        $branchId  = $user->branch_id ?? $request->integer('branch_id');

        $query = Product::active()
            ->where('company_id', $companyId)
            ->with(['primaryImage', 'category:id,name', 'brand:id,name', 'unit:id,name,short_name'])
            ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->filled('brand_id'), fn($q) => $q->where('brand_id', $request->brand_id))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = trim($request->search);
                $q->where(function ($sub) use ($term) {
                    $sub->where('name', 'like', "%{$term}%")
                        ->orWhere('sku', 'like', "%{$term}%")
                        ->orWhere('barcode', 'like', "%{$term}%");
                });
            })
            ->when($request->boolean('featured'), fn($q) => $q->where('is_featured', true))
            ->orderBy('name');

        $perPage = min($request->integer('per_page', 24), 100);
        $products = $query->paginate($perPage);

        // Preload branch stock for current page items
        $productIds = $products->pluck('id')->toArray();
        $stockMap = [];
        if ($branchId && !empty($productIds)) {
            $stockMap = Inventory::where('company_id', $companyId)
                ->where('branch_id', $branchId)
                ->whereIn('product_id', $productIds)
                ->pluck('quantity', 'product_id')
                ->toArray();
        }

        // Transform collection into lightweight mobile payload (No cost_price leaked)
        $products->getCollection()->transform(function ($p) use ($stockMap) {
            return [
                'id'            => $p->id,
                'name'          => $p->name,
                'sku'           => $p->sku,
                'barcode'       => $p->barcode,
                'selling_price' => (float) $p->selling_price,
                'stock_qty'     => (float) ($stockMap[$p->id] ?? 0),
                'image'         => $p->primaryImage?->image_url ?? $p->image_url,
                'category_id'   => $p->category_id,
                'category_name' => $p->category?->name,
                'brand_name'    => $p->brand?->name,
                'unit'          => $p->unit?->short_name ?? $p->unit?->name ?? 'pcs',
                'has_variants'  => (bool) $p->has_variants,
            ];
        });

        return $this->paginatedResponse($products);
    }

    /**
     * GET /api/v1/mobile/products/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id ?? 1;
        $branchId  = $user->branch_id ?? $request->integer('branch_id');

        $product = Product::active()
            ->where('company_id', $companyId)
            ->with([
                'images',
                'category:id,name',
                'brand:id,name',
                'unit:id,name,short_name',
                'variants.values.attributeValue.attribute',
            ])
            ->findOrFail($id);

        // Current branch stock
        $branchStock = Inventory::where('company_id', $companyId)
            ->where('branch_id', $branchId)
            ->where('product_id', $product->id)
            ->value('quantity') ?? 0;

        // Cross-branch stock lookup (in case customer asks if another branch has it)
        $otherBranchesStock = Inventory::where('company_id', $companyId)
            ->where('product_id', $product->id)
            ->where('branch_id', '!=', $branchId)
            ->with(['branch:id,name,phone'])
            ->get()
            ->map(fn($inv) => [
                'branch_id'   => $inv->branch_id,
                'branch_name' => $inv->branch?->name,
                'phone'       => $inv->branch?->phone,
                'quantity'    => (float) $inv->quantity,
            ]);

        return $this->successResponse([
            'id'                  => $product->id,
            'name'                => $product->name,
            'sku'                 => $product->sku,
            'barcode'             => $product->barcode,
            'selling_price'       => (float) $product->selling_price,
            'compare_price'       => $product->compare_price ? (float) $product->compare_price : null,
            'description'         => $product->short_description ?? $product->description,
            'stock_qty'           => (float) $branchStock,
            'other_branches_stock'=> $otherBranchesStock,
            'category'            => $product->category?->name,
            'brand'               => $product->brand?->name,
            'unit'                => $product->unit?->short_name ?? 'pcs',
            'images'              => $product->images->pluck('image_url'),
            'variants'            => $product->variants->map(fn($v) => [
                'id'      => $v->id,
                'name'    => $v->name,
                'sku'     => $v->sku,
                'barcode' => $v->barcode,
                'price'   => (float) ($v->price ?? $product->selling_price),
            ]),
        ]);
    }

    /**
     * GET /api/v1/mobile/categories
     */
    public function categories(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $categories = Category::active()
            ->where('company_id', $companyId)
            ->withCount(['products' => fn($q) => $q->active()])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'image'])
            ->map(fn($c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'slug'           => $c->slug,
                'image'          => $c->image_url ?? $c->image,
                'products_count' => $c->products_count,
            ]);

        return $this->successResponse($categories);
    }

    /**
     * GET /api/v1/mobile/brands
     */
    public function brands(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $brands = Brand::active()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo'])
            ->map(fn($b) => [
                'id'   => $b->id,
                'name' => $b->name,
                'slug' => $b->slug,
                'logo' => $b->logo_url ?? $b->logo,
            ]);

        return $this->successResponse($brands);
    }

    /**
     * GET /api/v1/mobile/products/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id ?? 1;
        $branchId  = $user->branch_id ?? $request->integer('branch_id');

        $totalActive = Product::active()->where('company_id', $companyId)->count();
        $lowStock = Inventory::where('company_id', $companyId)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->where('quantity', '<=', 5)
            ->count();

        return $this->successResponse([
            'total_active_products' => $totalActive,
            'low_stock_count'       => $lowStock,
        ]);
    }
}
