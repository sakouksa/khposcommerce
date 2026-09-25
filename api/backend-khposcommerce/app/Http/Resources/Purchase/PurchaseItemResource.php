<?php

namespace App\Http\Resources\Purchase;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Traits\FormatsMediaUrl;

class PurchaseItemResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        $product = $this->relationLoaded('product') ? $this->product : null;
        $variant = $this->relationLoaded('variant') ? $this->variant : null;

        $primaryImg = null;
        if ($product) {
            $primaryImg = $product->relationLoaded('primaryImage') && $product->primaryImage
                ? $product->primaryImage->image
                : ($product->relationLoaded('images') && $product->images->count() > 0
                    ? ($product->images->firstWhere('is_primary', true)?->image ?? $product->images->first()?->image)
                    : ($product->primaryImage?->image ?? $product->images?->first()?->image ?? $product->image ?? null));
        }

        $formattedImg = $this->formatMediaUrl($primaryImg);
        $variantImg = $variant ? $this->formatMediaUrl($variant->image) : null;

        return [
            'id'                 => $this->id,
            'purchase_id'        => $this->purchase_id,
            'product_id'         => $this->product_id,
            'product_variant_id' => $this->product_variant_id,
            'product_name'       => $this->product_name ?: ($product?->name ?? 'Unknown Product'),
            'sku'                => $this->sku ?: ($product?->sku ?? ''),
            'primary_image'      => $variantImg ?: $formattedImg,
            'image'              => $variantImg ?: $formattedImg,
            'product_image'      => $formattedImg,
            'quantity'           => (float)$this->quantity,
            'quantity_received'  => (float)$this->quantity_received,
            'already_returned'   => (float)$this->already_returned,
            'unit_cost'          => (float)$this->unit_cost,
            'discount_percent'   => (float)$this->discount_percent,
            'discount_amount'    => (float)$this->discount_amount,
            'tax_percent'        => (float)$this->tax_percent,
            'tax_amount'         => (float)$this->tax_amount,
            'subtotal'           => (float)$this->subtotal,
            'total'              => (float)$this->total,
            'currency_code'      => $this->currency_code,
            'exchange_rate'      => (float)$this->exchange_rate,
            'unit_cost_base'     => (float)$this->unit_cost_base,
            'subtotal_base'      => (float)$this->subtotal_base,
            'total_base'         => (float)$this->total_base,
            'notes'              => $this->notes,
            'product'            => $product ? [
                'id'            => $product->id,
                'name'          => $product->name,
                'sku'           => $product->sku,
                'barcode'       => $product->barcode,
                'primary_image' => $formattedImg,
                'image'         => $formattedImg,
                'category'      => $product->relationLoaded('category') && $product->category ? [
                    'id'   => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
            ] : null,
            'variant'            => $variant,
        ];
    }
}
