<?php

namespace App\Http\Resources\Company;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'slug'          => $this->slug,
            'email'         => $this->email,
            'phone'         => $this->phone,
            'website'       => $this->website,
            'address'       => $this->address,
            'city'          => $this->city,
            'province'      => $this->province,
            'country'       => $this->country,
            'postal_code'   => $this->postal_code,
            'tax_number'    => $this->tax_number,
            'logo'          => $this->formatMediaUrl($this->logo),
            'currency_code' => $this->currency_code,
            'timezone'      => $this->timezone,
            'language'      => $this->language,
            'is_active'     => (bool) ($this->is_active ?? true),
            'settings'      => $this->settings,
            'created_at'    => $this->created_at?->toIso8601String(),
            'updated_at'    => $this->updated_at?->toIso8601String(),
        ];
    }
}
