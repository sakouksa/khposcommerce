<?php

namespace App\Http\Controllers\Api\V1\Customer\Traits;

use Illuminate\Support\Facades\DB;

trait FormatsStorefrontData
{
    protected function formatProduct($product, array $extra = []): array
    {
        if (!$product) {
            return [];
        }

        $image = $product->primaryImage?->url
            ?? $product->primaryImage?->image
            ?? ($product->relationLoaded('images') && $product->images->isNotEmpty() ? ($product->images->first()->url ?? $product->images->first()->image) : null);

        $stock = (float) ($product->stock_quantity ?? $product->stock ?? 0);
        if ($stock <= 0 && $product->relationLoaded('inventories') && $product->inventories->isNotEmpty()) {
            $stock = (float) $product->inventories->sum('quantity');
        }
        if ($stock <= 0 && $product->relationLoaded('variants') && $product->variants->isNotEmpty()) {
            $stock = (float) $product->variants->sum(function ($v) {
                return $v->relationLoaded('inventories') ? (float) $v->inventories->sum('quantity') : (float) ($v->stock ?? 0);
            });
        }

        return array_merge([
            'id'                => $product->id,
            'name'              => $product->name,
            'slug'              => $product->slug,
            'sku'               => $product->sku,
            'selling_price'     => (float) $product->selling_price,
            'compare_price'     => (float) $product->compare_price,
            'discount_pct'      => $product->discount_percent_attribute ?? 0,
            'is_featured'       => (bool) $product->is_featured,
            'has_variants'      => (bool) $product->has_variants,
            'stock'             => $stock,
            'stock_quantity'    => $stock,
            'in_stock'          => $stock > 0,
            'rating_avg'        => (float) ($product->rating_avg ?: 4.8),
            'rating_count'      => (int) ($product->rating_count ?: 12),
            'sold_count'        => (int) ($product->sold_count ?? 0),
            'short_description' => $product->short_description,
            'description'       => $product->description,
            'weight'            => $product->weight ? (float) $product->weight : null,
            'length'            => $product->length ? (float) $product->length : null,
            'width'             => $product->width ? (float) $product->width : null,
            'height'            => $product->height ? (float) $product->height : null,
            'image'             => $image,
            'category'          => $product->category?->name,
            'category_slug'     => $product->category?->slug,
            'brand'             => $product->brand?->name,
            'brand_slug'        => $product->brand?->slug,
            'warranty'          => '1 Year Official Warranty (ធានា ១ ឆ្នាំ)',
        ], $extra);
    }

    protected function formatCategory($category, bool $withChildren = false): array
    {
        $data = [
            'id'            => $category->id,
            'name'          => $category->name,
            'slug'          => $category->slug,
            'icon'          => $category->icon,
            'image'         => $category->image,
            'description'   => $category->description,
            'product_count' => $category->products_count ?? 0,
        ];

        if ($withChildren && $category->relationLoaded('children')) {
            $data['children'] = $category->children->map(fn($c) => $this->formatCategory($c, false))->toArray();
        }

        return $data;
    }

    protected function formatProductList(array $products): array
    {
        return array_map(fn($p) => $this->formatProduct($p), $products);
    }

    protected function saveSearchHistory(int $userId, string $query): void
    {
        try {
            DB::table('search_histories')->updateOrInsert(
                ['user_id' => $userId, 'query' => $query],
                ['updated_at' => now(), 'created_at' => now()]
            );
        } catch (\Throwable) {
            // Silently ignore if table doesn't exist
        }
    }
}
