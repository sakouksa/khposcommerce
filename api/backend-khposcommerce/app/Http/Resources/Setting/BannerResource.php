<?php

namespace App\Http\Resources\Setting;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        $imageUrl = $this->formatMediaUrl($this->image);
        $mobileImageUrl = $this->formatMediaUrl($this->mobile_image) ?: $imageUrl;

        return [
            'id'           => $this->id,
            'company_id'   => $this->company_id,
            'store_id'     => $this->store_id,
            'title'        => $this->title,
            'subtitle'     => $this->subtitle,
            'image'        => $imageUrl,
            'image_url'    => $imageUrl,
            'mobile_image' => $mobileImageUrl,
            'link'         => $this->link,
            'link_url'     => $this->link,
            'position'     => $this->position,
            'sort_order'   => (int) ($this->sort_order ?? 0),
            'is_active'    => (bool) $this->is_active,
            'starts_at'    => $this->starts_at?->toIso8601String(),
            'ends_at'      => $this->ends_at?->toIso8601String(),
            'created_at'   => $this->created_at?->toIso8601String(),
            'updated_at'   => $this->updated_at?->toIso8601String(),
        ];
    }
}
