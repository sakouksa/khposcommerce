<?php

namespace App\Actions\Product;

use App\Models\Product\Product;
use Illuminate\Support\Facades\DB;

class UpdateProductAction
{
    public function execute(Product|int|string $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $productModel = $product instanceof Product ? $product : Product::findOrFail($product);
            $productModel->update($data);
            return $productModel;
        });
    }
}
