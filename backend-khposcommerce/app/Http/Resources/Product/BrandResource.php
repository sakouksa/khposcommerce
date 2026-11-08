<?php

namespace App\Http\Resources\Product;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'company_id'     => $this->company_id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'logo'           => $this->formatMediaUrl($this->logo),
            'description'    => $this->description,
            'website'        => $this->website,
            'is_active'      => (bool) ($this->is_active ?? true),
            'products_count' => $this->whenCounted('products'),
            'created_at'     => $this->created_at?->toIso8601String(),
            'updated_at'     => $this->updated_at?->toIso8601String(),
        ];
    }
}
