<?php

namespace App\Http\Resources\Product;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'product_id'    => $this->product_id,
            'name'          => $this->name,
            'sku'           => $this->sku,
            'barcode'       => $this->barcode,
            'cost_price'    => (float) $this->cost_price,
            'selling_price' => (float) $this->selling_price,
            'compare_price' => $this->compare_price ? (float) $this->compare_price : null,
            'weight'        => $this->weight ? (float) $this->weight : null,
            'image'         => $this->formatMediaUrl($this->image),
            'is_active'     => (bool) $this->is_active,
            'stock'         => ($this->relationLoaded('inventories') && $this->inventories->count() > 0)
                                ? (float) $this->inventories->sum('quantity')
                                : (float) ($this->stock ?? 0),
            'warehouse_stocks' => $this->whenLoaded('inventories', fn() => $this->inventories->map(fn($inv) => [
                'warehouse_id'      => $inv->warehouse_id,
                'warehouse_name'    => $inv->warehouse?->name ?? ('Warehouse #' . $inv->warehouse_id),
                'quantity'          => (float) $inv->quantity,
                'reserved_quantity' => (float) ($inv->reserved_quantity ?? 0),
            ])),
            'attributes'    => $this->whenLoaded('attributeValues', function() {
                return $this->attributeValues->map(fn($av) => [
                    'id'             => $av->id,
                    'attribute_id'   => $av->attribute_id,
                    'attribute_name' => $av->attribute?->name,
                    'value'          => $av->value,
                    'color_code'     => $av->color_code,
                ]);
            }),
        ];
    }
}
