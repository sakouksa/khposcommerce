<?php

namespace App\Http\Resources\Auth;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        $avatarUrl = $this->formatMediaUrl($this->avatar);

        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'username'      => $this->username,
            'email'         => $this->email,
            'phone'         => $this->phone,
            'avatar'        => $avatarUrl,
            'is_active'     => $this->is_active,
            'last_login_at'  => $this->last_login_at?->toIso8601String(),
            'roles'         => $this->whenLoaded('roles', fn() => $this->getRoleNames()),
            'permissions'   => $this->whenLoaded('permissions', fn() => $this->getAllPermissions()->pluck('name')),
            'company'       => $this->whenLoaded('company', fn() => [
                'id'         => $this->company?->id,
                'name'       => $this->company?->name,
                'logo'       => $this->formatMediaUrl($this->company?->logo),
                'phone'      => $this->company?->phone,
                'email'      => $this->company?->email,
                'website'    => $this->company?->website,
                'address'    => $this->company?->address,
                'city'       => $this->company?->city,
                'province'   => $this->company?->province,
                'country'    => $this->company?->country,
                'tax_number' => $this->company?->tax_number,
            ]),
            'branch' => $this->whenLoaded('branch', fn() => [
                'id'   => $this->branch?->id,
                'name' => $this->branch?->name,
            ]),
            'employee' => $this->whenLoaded('employee', fn() => [
                'id'              => $this->employee?->id,
                'employee_number' => $this->employee?->employee_number,
                'status'          => $this->employee?->status,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
