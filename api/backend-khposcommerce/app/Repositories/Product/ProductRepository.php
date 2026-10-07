<?php

namespace App\Repositories\Product;

use App\Repositories\Contracts\BaseRepositoryInterface;
use App\Repositories\BaseRepository;
use App\Models\Product\Product;
use Illuminate\Pagination\LengthAwarePaginator;

use App\Repositories\Contracts\Product\ProductRepositoryInterface;

class ProductRepository extends BaseRepository implements ProductRepositoryInterface
{
    public function __construct(Product $model)
    {
        parent::__construct($model);
    }

    public function paginateWithFilters(
        array $filters = [],
        int $perPage = 10,
        string $sort = 'created_at',
        string $order = 'desc'
    ): LengthAwarePaginator {
        $query = $this->model
            ->with(['category:id,name', 'brand:id,name', 'primaryImage', 'images', 'unit:id,name,symbol', 'tax:id,name,rate,type', 'inventories', 'variants.inventories', 'variants.attributeValues.attribute'])
            ->withSum('inventories as stock', 'quantity')
            ->when($filters['search'] ?? null, fn($q, $v) => $q->search($v))
            ->when($filters['category_id'] ?? null, function ($q, $v) {
                if ($v !== 'all' && $v !== 'null' && (int)$v > 0) {
                    $q->where('category_id', $v);
                }
            })
            ->when($filters['brand_id'] ?? null, fn($q, $v) => $q->where('brand_id', $v))
            ->when($filters['unit_id'] ?? null, fn($q, $v) => $q->where('unit_id', $v))
            ->when($filters['tax_id'] ?? null, fn($q, $v) => $q->where('tax_id', $v))
            ->when(isset($filters['is_featured']), fn($q) => $q->where('is_featured', (bool)$filters['is_featured']))
            ->when(isset($filters['is_digital']), fn($q) => $q->where('is_digital', (bool)$filters['is_digital']))
            ->when(isset($filters['has_variants']), fn($q) => $q->where('has_variants', (bool)$filters['has_variants']))
            ->when($filters['status'] ?? null, function ($q, $v) {
                if ($v === 'deleted') {
                    $q->onlyTrashed();
                } elseif ($v && $v !== 'all') {
                    $q->where('status', $v);
                }
            })
            ->when($filters['company_id'] ?? null, fn($q, $v) => $q->where('company_id', $v))
            ->when($filters['inventory'] ?? null, function ($q, $v) {
                if ($v === 'low_stock') {
                    $q->where('track_inventory', true)
                      ->whereRaw('(SELECT COALESCE(SUM(quantity), 0) FROM inventories WHERE inventories.product_id = products.id) <= products.low_stock_threshold');
                } elseif ($v === 'out_of_stock') {
                    $q->whereRaw('(SELECT COALESCE(SUM(quantity), 0) FROM inventories WHERE inventories.product_id = products.id) = 0');
                } elseif ($v === 'in_stock') {
                    $q->whereRaw('(SELECT COALESCE(SUM(quantity), 0) FROM inventories WHERE inventories.product_id = products.id) > 0');
                }
            })
            ->when($filters['created_start'] ?? $filters['start_date'] ?? $filters['created_from'] ?? $filters['date_from'] ?? null, fn($q, $v) => $q->where('created_at', '>=', str_contains($v, ' ') ? $v : "{$v} 00:00:00"))
            ->when($filters['created_end'] ?? $filters['end_date'] ?? $filters['created_to'] ?? $filters['date_to'] ?? null, fn($q, $v) => $q->where('created_at', '<=', str_contains($v, ' ') ? $v : "{$v} 23:59:59"))
            ->when($filters['updated_start'] ?? null, fn($q, $v) => $q->where('updated_at', '>=', str_contains($v, ' ') ? $v : "{$v} 00:00:00"))
            ->when($filters['updated_end'] ?? null, fn($q, $v) => $q->where('updated_at', '<=', str_contains($v, ' ') ? $v : "{$v} 23:59:59"))
            ->when($filters['price_min'] ?? null, fn($q, $v) => $q->where('selling_price', '>=', (float) $v))
            ->when($filters['price_max'] ?? null, fn($q, $v) => $q->where('selling_price', '<=', (float) $v))
            ->when($filters['warehouse_id'] ?? null, function ($q, $v) {
                $q->whereHas('inventories', fn($iq) => $iq->where('warehouse_id', $v));
            });

        $allowedSorts = ['id', 'name', 'sku', 'selling_price', 'cost_price', 'created_at', 'sold_count', 'rating_avg', 'status', 'category_id', 'stock'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'id';

        return $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc')
                     ->paginate($perPage);
    }

    public function findBySku(string $sku)
    {
        return $this->model->where('sku', $sku)->first();
    }

    public function search(string $query, int $perPage = 15)
    {
        return $this->model->where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('sku', 'like', "%{$query}%")
              ->orWhere('barcode', 'like', "%{$query}%");
        })->paginate($perPage);
    }
}
