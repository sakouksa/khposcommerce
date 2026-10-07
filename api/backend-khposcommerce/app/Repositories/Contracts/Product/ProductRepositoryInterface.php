<?php

namespace App\Repositories\Contracts\Product;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface extends BaseRepositoryInterface
{
    public function paginateWithFilters(
        array $filters = [],
        int $perPage = 10,
        string $sort = 'created_at',
        string $order = 'desc'
    ): LengthAwarePaginator;

    public function findBySku(string $sku);
    public function search(string $query, int $perPage = 15);
}
