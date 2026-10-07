<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Controllers\Api\V1\Customer\Traits\FormatsStorefrontData;
use App\Models\Product\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SearchController extends BaseApiController
{
    use FormatsStorefrontData;

    // ─── GET /api/v1/customer/search ─────────────────────────────────────────

    public function search(Request $request): JsonResponse
    {
        $query      = $request->input('q', '');
        $searchType = $request->input('search_type', 'ai'); // 'ai', 'name', 'sku'
        $perPage    = $request->integer('per_page', 20);
        $sortBy     = $request->input('sort', 'relevance');
        $minPrice   = $request->input('min_price');
        $maxPrice   = $request->input('max_price');
        $category   = $request->input('category');
        $brand      = $request->input('brand');
        $rating     = $request->input('rating');
        $inStock    = $request->boolean('in_stock');

        $productQuery = Product::active()
            ->with(['primaryImage', 'category', 'brand', 'inventories', 'variants.inventories'])
            ->when($query, function ($q) use ($query, $searchType) {
                if ($searchType === 'sku') {
                    $q->where(function ($sub) use ($query) {
                        $sub->where('sku', 'like', "%{$query}%")
                            ->orWhere('barcode', 'like', "%{$query}%");
                    });
                } elseif ($searchType === 'name') {
                    $q->where('name', 'like', "%{$query}%");
                } else {
                    $q->search($query);
                }
            })
            ->when($minPrice, fn($q) => $q->where('selling_price', '>=', $minPrice))
            ->when($maxPrice, fn($q) => $q->where('selling_price', '<=', $maxPrice))
            ->when($category, fn($q) => $q->whereHas('category', fn($qc) => $qc->where('slug', $category)->orWhere('id', $category)))
            ->when($brand, fn($q) => $q->whereHas('brand', fn($qb) => $qb->where('slug', $brand)->orWhere('id', $brand)))
            ->when($rating, fn($q) => $q->where('rating_avg', '>=', $rating))
            ->when($inStock, fn($q) => $q->whereHas('inventories', fn($qi) => $qi->where('quantity', '>', 0)));

        match ($sortBy) {
            'price_asc'   => $productQuery->orderBy('selling_price', 'asc')->orderByDesc('id'),
            'price_desc'  => $productQuery->orderBy('selling_price', 'desc')->orderByDesc('id'),
            'newest'      => $productQuery->orderBy('created_at', 'desc')->orderByDesc('id'),
            'popular'     => $productQuery->orderByDesc('sold_count')->orderByDesc('view_count')->orderByDesc('id'),
            'top_rated'   => $productQuery->orderByDesc('rating_avg')->orderByDesc('id'),
            'name_asc'    => $productQuery->orderBy('name', 'asc')->orderByDesc('id'),
            default       => $productQuery->orderByDesc('is_featured')->orderByDesc('sold_count')->orderByDesc('id'),
        };

        if ($request->filled('cursor')) {
            try {
                $products = $productQuery->cursorPaginate($perPage);
                return response()->json([
                    'success' => true,
                    'message' => 'Success',
                    'data'    => collect($products->items())->map(fn($p) => $this->formatProduct($p))->values(),
                    'meta'    => [
                        'per_page'    => $products->perPage(),
                        'next_cursor' => $products->nextCursor()?->encode(),
                        'prev_cursor' => $products->previousCursor()?->encode(),
                        'has_more'    => $products->hasMorePages(),
                        'query'       => $query,
                        'search_type' => $searchType,
                    ],
                ]);
            } catch (\Throwable) {
                // Fallback to offset pagination
            }
        }

        $products = $productQuery->paginate($perPage);

        $suggestions = [];
        if ($query && $products->total() === 0) {
            $suggestions = Product::active()
                ->where('name', 'like', '%' . substr($query, 0, 3) . '%')
                ->limit(5)
                ->pluck('name');
        }

        if ($query && $request->user()) {
            $this->saveSearchHistory($request->user()->id, $query);
        }

        return response()->json([
            'success'      => true,
            'message'      => 'Success',
            'data'         => collect($products->items())->map(fn($p) => $this->formatProduct($p))->values(),
            'current_page' => $products->currentPage(),
            'last_page'    => $products->lastPage(),
            'per_page'     => $products->perPage(),
            'total'        => $products->total(),
            'meta'         => [
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'has_more'     => $products->hasMorePages(),
                'next_page'    => $products->hasMorePages() ? $products->currentPage() + 1 : null,
                'suggestions'  => $suggestions,
                'query'        => $query,
                'search_type'  => $searchType,
            ],
            // Backwards compatibility
            'results'      => collect($products->items())->map(fn($p) => $this->formatProduct($p))->values(),
        ]);
    }

    // ─── GET /api/v1/customer/search/autocomplete ────────────────────────────

    public function autocomplete(Request $request): JsonResponse
    {
        $q          = $request->input('q', '');
        $searchType = $request->input('search_type', 'ai');
        $results    = [];

        if (strlen($q) >= 2) {
            $results = Product::active()
                ->when($searchType === 'sku', function ($query) use ($q) {
                    $query->where('sku', 'like', "%{$q}%")
                          ->orWhere('barcode', 'like', "%{$q}%");
                })
                ->when($searchType === 'name', function ($query) use ($q) {
                    $query->where('name', 'like', "%{$q}%");
                })
                ->when($searchType === 'ai', function ($query) use ($q) {
                    $query->where(function ($sub) use ($q) {
                        $sub->where('name', 'like', "%{$q}%")
                            ->orWhere('sku', 'like', "%{$q}%")
                            ->orWhere('description', 'like', "%{$q}%")
                            ->orWhereHas('category', fn($qc) => $qc->where('name', 'like', "%{$q}%"))
                            ->orWhereHas('brand', fn($qb) => $qb->where('name', 'like', "%{$q}%"));
                    });
                })
                ->select('id', 'name', 'slug', 'sku', 'selling_price', 'compare_price', 'category_id', 'brand_id')
                ->with(['primaryImage', 'category', 'brand'])
                ->limit(8)
                ->get()
                ->map(fn($p) => [
                    'id'            => $p->id,
                    'name'          => $p->name,
                    'slug'          => $p->slug,
                    'sku'           => $p->sku,
                    'price'         => (float) $p->selling_price,
                    'compare_price' => (float) $p->compare_price,
                    'image'         => $p->primaryImage?->url ?? $p->primaryImage?->image,
                    'category'      => $p->category?->name,
                    'brand'         => $p->brand?->name,
                ]);
        }

        return $this->successResponse($results);
    }

    // ─── GET /api/v1/customer/trending-searches ──────────────────────────────

    public function trendingSearches(): JsonResponse
    {
        $trending = Cache::remember('trending_searches', 3600, function () {
            try {
                return DB::table('search_histories')
                    ->select('query', DB::raw('COUNT(*) as count'))
                    ->where('created_at', '>=', now()->subDays(7))
                    ->groupBy('query')
                    ->orderByDesc('count')
                    ->limit(10)
                    ->pluck('query');
            } catch (\Throwable) {
                return ['Apple', 'Smartwatch', 'Headphones', 'Keyboards', 'Shoes', 'Audio'];
            }
        });

        return $this->successResponse($trending);
    }
}
