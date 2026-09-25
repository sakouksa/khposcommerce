<?php

namespace App\Http\Resources\Product;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'company_id'     => $this->company_id,
            'parent_id'      => $this->parent_id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'image'          => $this->formatMediaUrl($this->image),
            'icon'           => $this->icon,
            'description'    => $this->description,
            'is_active'      => (bool) ($this->is_active ?? true),
            'sort_order'     => $this->sort_order ?? 0,
            'parent'         => new CategoryResource($this->whenLoaded('parent')),
            'children'       => CategoryResource::collection($this->whenLoaded('children')),
            'products_count' => $this->whenCounted('products'),
            'created_at'     => $this->created_at?->toIso8601String(),
            'updated_at'     => $this->updated_at?->toIso8601String(),
        ];
    }
}
