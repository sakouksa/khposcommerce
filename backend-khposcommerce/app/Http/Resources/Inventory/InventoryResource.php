<?php

namespace App\Http\Resources\Inventory;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        $primaryImg = $this->product?->primaryImage?->image
            ?? ($this->product?->relationLoaded('images') ? ($this->product->images->firstWhere('is_primary', true)?->image ?? $this->product->images->first()?->image) : null)
            ?? $this->product?->image;

        return [
            'id'                 => $this->id,
            'warehouse_id'       => $this->warehouse_id,
            'product_id'         => $this->product_id,
            'product_variant_id' => $this->product_variant_id,
            'sku'                => $this->variant?->sku ?? $this->product?->sku,
            'stock_qty'          => (float) $this->quantity,
            'quantity'           => (float) $this->quantity,
            'reserved_quantity'  => (float) $this->reserved_quantity,
            'available_quantity' => (float) $this->available_quantity,
            'reorder_point'      => (float) $this->reorder_point,
            'reorder_qty'        => (float) $this->reorder_qty,
            'min_stock_qty'      => (float) ($this->product?->low_stock_threshold ?? 5),
            'created_at'         => $this->created_at?->toIso8601String(),
            'updated_at'         => $this->updated_at?->toIso8601String(),
            
            'variant' => $this->whenLoaded('variant', fn() => $this->variant ? [
                'id'            => $this->variant->id,
                'name'          => $this->variant->name,
                'sku'           => $this->variant->sku,
                'barcode'       => $this->variant->barcode,
                'selling_price' => $this->variant->selling_price,
                'image'         => $this->formatMediaUrl($this->variant->image),
            ] : null),
            'product' => $this->whenLoaded('product', fn() => [
                'id'            => $this->product?->id,
                'name'          => $this->product?->name,
                'sku'           => $this->product?->sku,
                'primary_image' => $this->formatMediaUrl($primaryImg),
                'image'         => $this->formatMediaUrl($primaryImg),
                'images'        => $this->product?->relationLoaded('images') ? $this->product->images->map(fn($img) => [
                    'id'         => $img->id,
                    'url'        => $this->formatMediaUrl($img->image),
                    'image'      => $this->formatMediaUrl($img->image),
                    'is_primary' => (bool) $img->is_primary,
                ]) : [],
                'category' => $this->product?->category ? [
                    'id'   => $this->product->category->id,
                    'name' => $this->product->category->name,
                ] : null,
                'brand' => $this->product?->brand ? [
                    'id'   => $this->product->brand->id,
                    'name' => $this->product->brand->name,
                ] : null,
                'unit' => $this->product?->unit ? [
                    'id'   => $this->product->unit->id,
                    'name' => $this->product->unit->name,
                ] : null,
            ]),
            'warehouse' => $this->whenLoaded('warehouse', fn() => [
                'id'   => $this->warehouse?->id,
                'name' => $this->warehouse?->name,
            ]),
        ];
    }
}
