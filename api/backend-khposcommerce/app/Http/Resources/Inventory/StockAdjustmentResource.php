<?php

namespace App\Http\Resources\Inventory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockAdjustmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $firstItem = $this->relationLoaded('items') ? $this->items->first() : null;

        return [
            'id'               => $this->id,
            'reference_number' => $this->reference_number,
            'date'             => $this->date,
            'type'             => $this->type,
            'reason'           => $this->reason,
            'notes'            => $this->reason ?: ($firstItem?->notes ?? ''),
            'status'           => $this->status,
            'status_badge'     => !empty($this->status) ? \App\Format\GlobalFormat::statusBadge($this->status) : null,
            'approved_at'      => $this->approved_at,
            'created_at'       => $this->created_at?->toIso8601String(),
            'updated_at'       => $this->updated_at?->toIso8601String(),
            
            // Warehouse relation
            'warehouse' => $this->whenLoaded('warehouse', fn() => [
                'id'   => $this->warehouse?->id,
                'name' => $this->warehouse?->name,
            ]),
            
            // User relation
            'user' => $this->whenLoaded('user', fn() => [
                'id'   => $this->user?->id,
                'name' => $this->user?->name,
            ]),

            // Items relation
            'items' => $this->whenLoaded('items', fn() => $this->items->map(fn($item) => [
                'id'                 => $item->id,
                'product_id'         => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'quantity_before'    => (float) $item->quantity_before,
                'quantity_adjusted'  => (float) $item->quantity_adjusted,
                'quantity_after'     => (float) $item->quantity_after,
                'notes'              => $item->notes,
                'product'            => $item->product ? [
                    'id'   => $item->product->id,
                    'name' => $item->product->name,
                    'sku'  => $item->product->sku,
                ] : null,
                'variant'            => $item->variant ? [
                    'id'   => $item->variant->id,
                    'name' => $item->variant->name,
                ] : null,
            ])),

            // Flat fields for simple frontend table (mapped from first item)
            'product' => $firstItem && $firstItem->product ? [
                'id'   => $firstItem->product->id,
                'name' => $firstItem->product->name,
                'sku'  => $firstItem->product->sku,
            ] : null,
            
            'quantity' => $firstItem ? (float) $firstItem->quantity_adjusted : 0,
        ];
    }
}
