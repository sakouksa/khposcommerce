<?php

namespace App\Actions\Product;

use App\Models\Product\Product;
use Illuminate\Support\Facades\DB;

class CreateProductAction
{
    /**
     * Create product with optional variants and prices.
     */
    public function execute(array $productData): Product
    {
        return DB::transaction(function () use ($productData) {
            return Product::create($productData);
        });
    }
}
