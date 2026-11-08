<?php

namespace App\Actions\Product;

use App\Models\Product\Product;

class DeleteProductAction
{
    public function execute(Product|int|string $product): bool
    {
        $productModel = $product instanceof Product ? $product : Product::findOrFail($product);
        return (bool) $productModel->delete();
    }
}
