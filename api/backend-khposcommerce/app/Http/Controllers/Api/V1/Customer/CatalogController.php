<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Controllers\Api\V1\Customer\Traits\FormatsStorefrontData;
use App\Http\Requests\Customer\ValidateCouponRequest;
use App\Services\Sales\PricingService;
use App\Models\Product\Product;
use App\Models\Product\Category;
use App\Models\Product\Brand;
use App\Models\Marketing\FlashSale;
use App\Models\Review\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CatalogController extends BaseApiController
{
    use FormatsStorefrontData;

    protected PricingService $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    // ─── GET /api/v1/customer/categories ─────────────────────────────────────

    public function categories(Request $request): JsonResponse
    {
        $withTree = $request->boolean('tree', true);

        $categories = Category::active()
            ->when($withTree, fn($q) => $q->root()->with(['children' => fn($qc) => $qc->active()->withCount('products')]))
            ->withCount(['products' => fn($q) => $q->active()])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $data = $categories->map(fn($c) => $this->formatCategory($c, $withTree));

        return $this->successResponse($data);
    }

    // ─── GET /api/v1/customer/brands ─────────────────────────────────────────

    public function brands(Request $request): JsonResponse
    {
        $brands = Brand::active()
            ->withCount(['products' => fn($q) => $q->active()])
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo', 'description', 'website', 'is_featured'])
            ->map(fn($b) => [
                'id'            => $b->id,
                'name'          => $b->name,
                'slug'          => $b->slug,
                'logo'          => $b->logo_url ?? $b->logo,
                'description'   => $b->description,
                'website'       => $b->website,
                'is_featured'   => (bool) $b->is_featured,
                'product_count' => $b->products_count,
            ]);

        return $this->successResponse($brands);
    }

    // ─── GET /api/v1/customer/products ───────────────────────────────────────

    public function products(Request $request): JsonResponse
    {
        $perPage   = (int) $request->input('per_page', 16);
        $category  = $request->input('category');
        $brand     = $request->input('brand');
        $minPrice  = $request->input('min_price');
        $maxPrice  = $request->input('max_price');
        $featured  = $request->boolean('featured');
        $sortBy    = $request->input('sort', 'newest');
        $tag       = $request->input('tag');
        $inStock   = $request->boolean('in_stock');
        $hasDeal   = $request->boolean('deal');

        $query = Product::active()
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->when($category, function ($q, $c) {
                $q->whereHas('category', fn($qc) => is_numeric($c) ? $qc->where('id', (int)$c) : $qc->where('slug', $c));
            })
            ->when($brand, function ($q, $b) {
                $q->whereHas('brand', fn($qb) => is_numeric($b) ? $qb->where('id', (int)$b) : $qb->where('slug', $b));
            })
            ->when($minPrice, fn($q, $p) => $q->where('selling_price', '>=', (float) $p))
            ->when($maxPrice, fn($q, $p) => $q->where('selling_price', '<=', (float) $p))
            ->when($featured, fn($q) => $q->featured())
            ->when($inStock, fn($q) => $q->whereHas('inventories', fn($qi) => $qi->where('quantity', '>', 0)))
            ->when($hasDeal, fn($q) => $q->whereNotNull('compare_price')->whereColumn('selling_price', '<', 'compare_price'))
            ->when($tag, function ($q, $t) {
                match ($t) {
                    'featured'     => $q->featured(),
                    'best_sellers' => $q->orderByDesc('sold_count'),
                    'popular'      => $q->orderByDesc('view_count'),
                    'deals'        => $q->whereNotNull('compare_price')->whereColumn('selling_price', '<', 'compare_price'),
                    'new_arrivals' => $q->orderBy('created_at', 'desc'),
                    default        => null,
                };
            });

        match ($sortBy) {
            'price_asc'    => $query->orderBy('selling_price', 'asc'),
            'price_desc'   => $query->orderBy('selling_price', 'desc'),
            'popular'      => $query->orderByDesc('view_count')->orderByDesc('sold_count'),
            'best_sellers' => $query->orderByDesc('sold_count'),
            'rating'       => $query->orderByDesc('rating_avg'),
            'name_asc'     => $query->orderBy('name', 'asc'),
            'name_desc'    => $query->orderBy('name', 'desc'),
            'deals'        => $query->orderByRaw('((compare_price - selling_price) / compare_price) DESC'),
            default        => $query->orderBy('created_at', 'desc'),
        };

        if ($request->filled('cursor')) {
            try {
                $products = $query->cursorPaginate($perPage);
                return response()->json([
                    'success' => true,
                    'message' => 'Success',
                    'data'    => collect($products->items())->map(fn($p) => $this->formatProduct($p))->values(),
                    'meta'    => [
                        'per_page'    => $products->perPage(),
                        'next_cursor' => $products->nextCursor()?->encode(),
                        'prev_cursor' => $products->previousCursor()?->encode(),
                        'has_more'    => $products->hasMorePages(),
                    ],
                ]);
            } catch (\Throwable) {
                // Fallback to offset pagination
            }
        }

        $paginator = $query->paginate($perPage);
        $paginator->setCollection($paginator->getCollection()->map(fn($p) => $this->formatProduct($p)));

        return $this->paginatedResponse($paginator);
    }

    // ─── GET /api/v1/customer/products/{slug} ─────────────────────────────────

    public function productDetail(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int)$slug : 0)
            ->with([
                'images' => fn($q) => $q->orderBy('sort_order'),
                'category',
                'brand',
                'unit',
                'inventories',
                'variants.inventories',
                'variants.values.attributeValue.attribute',
                'prices',
                'approvedReviews.customer:id,name,photo',
            ])
            ->first();

        if (!$product || $product->status !== 'active') {
            return $this->errorResponse('Product not found', null, 404);
        }

        // Increment view count asynchronously/silently
        try {
            $product->increment('view_count');
        } catch (\Throwable) {}

        $relatedProducts = Product::active()
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product) {
                $q->where('category_id', $product->category_id)
                  ->orWhere('brand_id', $product->brand_id);
            })
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->limit(8)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        $data = array_merge($this->formatProduct($product), [
            'description'       => $product->description,
            'short_description' => $product->short_description,
            'barcode'           => $product->barcode,
            'unit'              => $product->unit?->name,
            'weight'            => $product->weight,
            'dimensions'        => $product->dimensions,
            'specifications'    => $product->specifications ?? [],
            'images'            => $product->images->map(fn($img) => [
                'id'         => $img->id,
                'url'        => $img->url ?? $img->image,
                'is_primary' => (bool) $img->is_primary,
                'alt'        => $img->alt ?? $product->name,
            ]),
            'variants'          => $product->variants->map(fn($v) => [
                'id'             => $v->id,
                'name'           => $v->name,
                'sku'            => $v->sku,
                'barcode'        => $v->barcode,
                'selling_price'  => (float) ($v->price ?: $product->selling_price),
                'compare_price'  => (float) ($v->compare_price ?: $product->compare_price),
                'stock_quantity' => (float) ($v->relationLoaded('inventories') ? $v->inventories->sum('quantity') : ($v->stock_quantity ?? $v->stock ?? 0)),
                'image'          => $v->image,
                'attributes'     => $v->values->map(fn($val) => [
                    'attribute_id'   => $val->attributeValue?->attribute_id,
                    'attribute_name' => $val->attributeValue?->attribute?->name,
                    'value_id'       => $val->attribute_value_id,
                    'value'          => $val->attributeValue?->value,
                ]),
            ]),
            'reviews'           => $product->approvedReviews->map(fn($r) => [
                'id'                  => $r->id,
                'customer_name'       => $r->customer?->name ?? 'Customer',
                'customer_avatar'     => $r->customer?->photo,
                'rating'              => (int) $r->rating,
                'title'               => $r->title,
                'body'                => $r->body,
                'is_verified_purchase'=> (bool) $r->is_verified_purchase,
                'created_at'          => $r->created_at?->toISOString(),
            ]),
            'related_products'  => $relatedProducts,
        ]);

        return $this->successResponse($data);
    }

    // ─── GET /api/v1/customer/flash-sale ──────────────────────────────────────

    public function flashSale(): JsonResponse
    {
        $sale = FlashSale::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->with(['items.product.primaryImage', 'items.product.category', 'items.product.brand'])
            ->first();

        if (!$sale) {
            return $this->successResponse(null, 'No active flash sale');
        }

        $data = [
            'id'          => $sale->id,
            'name'        => $sale->name,
            'description' => $sale->description,
            'starts_at'   => $sale->starts_at?->toISOString(),
            'ends_at'     => $sale->ends_at?->toISOString(),
            'items'       => $sale->items->map(function ($item) {
                if (!$item->product) return null;
                return $this->formatProduct($item->product, [
                    'flash_price'  => (float) ($item->flash_price ?: $item->product->selling_price),
                    'discount_pct' => (float) ($item->discount_percent ?: $item->product->discount_percent_attribute ?: 25),
                    'quota'        => (int) ($item->quota ?: 50),
                    'sold_count'   => (int) ($item->sold_count ?: 12),
                ]);
            })->filter()->values(),
        ];

        return $this->successResponse($data);
    }

    // ─── POST /api/v1/customer/coupons/validate ───────────────────────────────

    public function validateCoupon(ValidateCouponRequest $request): JsonResponse
    {
        $code   = $request->input('code');
        $amount = (float) $request->input('amount', 0);

        $result = $this->pricingService->validateCoupon($code, $amount, auth()->id());

        if (!$result['valid']) {
            return $this->errorResponse($result['message'], null, 422);
        }

        return $this->successResponse([
            'coupon'          => $result['coupon'],
            'discount_amount' => $result['discount_amount'],
        ], $result['message']);
    }
}
