<?php

namespace App\Http\Resources\Purchase;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseReturnItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'purchase_return_id' => $this->purchase_return_id,
            'purchase_item_id'   => $this->purchase_item_id,
            'product_id'         => $this->product_id,
            'product_variant_id' => $this->product_variant_id,
            'batch_number'       => $this->batch_number,
            'serial_number'      => $this->serial_number,
            'product_name'       => $this->product?->name ?? $this->purchaseItem?->product_name ?? null,
            'sku'                => $this->product?->sku ?? $this->purchaseItem?->sku ?? null,
            'quantity'           => (float)$this->quantity,
            'unit_cost'          => (float)$this->unit_cost,
            'total'              => (float)$this->total,
            'unit_cost_base'     => (float)($this->unit_cost_base ?? $this->unit_cost),
            'total_base'         => (float)($this->total_base ?? $this->total),
            'notes'              => $this->notes,
            'variant'            => $this->relationLoaded('variant') ? $this->variant : null,
            'product'            => $this->relationLoaded('product') ? $this->product : null,
        ];
    }
}
