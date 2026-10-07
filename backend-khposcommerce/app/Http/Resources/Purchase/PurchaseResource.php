<?php

namespace App\Http\Resources\Purchase;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'company_id'       => $this->company_id,
            'branch_id'        => $this->branch_id,
            'warehouse_id'     => $this->warehouse_id,
            'supplier_id'      => $this->supplier_id,
            'user_id'          => $this->user_id,
            'reference_number' => $this->reference_number,
            'date'             => $this->date ? $this->date->format('Y-m-d') : null,
            'due_date'         => $this->due_date ? $this->due_date->format('Y-m-d') : null,
            'status'           => $this->status,
            'status_badge'     => !empty($this->status) ? \App\Format\GlobalFormat::statusBadge($this->status) : null,
            'payment_status'   => $this->payment_status,
            'payment_status_badge' => !empty($this->payment_status) ? \App\Format\GlobalFormat::statusBadge($this->payment_status) : null,
            'subtotal'         => (float)$this->subtotal,
            'tax_amount'       => (float)$this->tax_amount,
            'discount_amount'  => (float)$this->discount_amount,
            'shipping_cost'    => (float)$this->shipping_cost,
            'grand_total'      => (float)$this->grand_total,
            'grand_total_formatted' => \App\Format\GlobalFormat::money($this->grand_total ?? 0, $this->currency_code ?? 'USD'),
            'paid_amount'      => (float)$this->paid_amount,
            'paid_amount_formatted' => \App\Format\GlobalFormat::money($this->paid_amount ?? 0, $this->currency_code ?? 'USD'),
            'due_amount'       => (float)$this->due_amount,
            'due_amount_formatted'  => \App\Format\GlobalFormat::money($this->due_amount ?? 0, $this->currency_code ?? 'USD'),
            'subtotal_base'        => (float)$this->subtotal_base,
            'tax_amount_base'      => (float)$this->tax_amount_base,
            'discount_amount_base' => (float)$this->discount_amount_base,
            'shipping_cost_base'   => (float)$this->shipping_cost_base,
            'grand_total_base'     => (float)$this->grand_total_base,
            'paid_amount_base'     => (float)$this->paid_amount_base,
            'due_amount_base'      => (float)$this->due_amount_base,
            'currency_code'    => $this->currency_code,
            'exchange_rate'    => (float)$this->exchange_rate,
            'notes'            => $this->notes,
            'created_at'       => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at'       => $this->updated_at ? $this->updated_at->toIso8601String() : null,
            'items_count'      => $this->items_count ?? ($this->relationLoaded('items') ? count($this->items) : 0),
            
            // Relations
            'supplier'         => $this->relationLoaded('supplier') ? $this->supplier : null,
            'warehouse'        => $this->relationLoaded('warehouse') ? $this->warehouse : null,
            'branch'           => $this->relationLoaded('branch') ? $this->branch : null,
            'creator'          => $this->relationLoaded('creator') && $this->creator ? [
                'id'   => $this->creator->id,
                'name' => $this->creator->name,
            ] : null,
            'items'            => $this->relationLoaded('items') ? PurchaseItemResource::collection($this->items) : [],
            'returns'          => $this->relationLoaded('returns') ? PurchaseReturnResource::collection($this->returns) : [],
        ];
    }
}
