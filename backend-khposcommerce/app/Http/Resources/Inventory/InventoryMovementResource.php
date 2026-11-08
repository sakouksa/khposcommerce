<?php

namespace App\Http\Resources\Inventory;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryMovementResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        $primaryImg = $this->product?->primaryImage?->image
            ?? ($this->product?->relationLoaded('images') ? ($this->product->images->firstWhere('is_primary', true)?->image ?? $this->product->images->first()?->image) : null)
            ?? $this->product?->image;

        return [
            'id'              => $this->id,
            'warehouse_id'    => $this->warehouse_id,
            'product_id'      => $this->product_id,
            'user_id'         => $this->user_id,
            'reference_type'  => $this->reference_type,
            'reference_id'    => $this->reference_id,
            'type'            => $this->type,
            'type_badge'      => !empty($this->type) ? \App\Format\GlobalFormat::statusBadge($this->type) : null,
            'quantity'        => (float) $this->quantity,
            'quantity_formatted' => \App\Format\GlobalFormat::quantity($this->quantity),
            'quantity_before' => (float) $this->quantity_before,
            'quantity_after'  => (float) $this->quantity_after,
            'unit_cost'       => $this->unit_cost ? (float) $this->unit_cost : null,
            'unit_cost_formatted' => $this->unit_cost ? \App\Format\GlobalFormat::money($this->unit_cost) : null,
            'notes'           => $this->notes,
            'reason'          => $this->notes, // Alias for frontend
            'created_at'      => $this->created_at?->toIso8601String(),
            'updated_at'      => $this->updated_at?->toIso8601String(),
            
            'product' => [
                'id'            => $this->product?->id,
                'name'          => $this->product?->name,
                'sku'           => $this->product?->sku,
                'primary_image' => $this->formatMediaUrl($primaryImg),
                'image'         => $this->formatMediaUrl($primaryImg),
                'category'      => $this->product?->category ? [
                    'id'   => $this->product->category->id,
                    'name' => $this->product->category->name,
                ] : null,
            ],
            'warehouse' => [
                'id'   => $this->warehouse?->id,
                'name' => $this->warehouse?->name,
            ],
        ];
    }
}
