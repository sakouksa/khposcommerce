<?php

namespace App\Http\Resources\Auth;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        $avatarUrl = $this->formatMediaUrl($this->avatar);

        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'phone'          => $this->phone,
            'avatar'         => $avatarUrl,
            'gender'         => $this->gender,
            'date_of_birth'  => $this->date_of_birth ? $this->date_of_birth->format('Y-m-d') : null,
            'address'        => $this->address,
            'country'        => $this->country,
            'province'       => $this->province,
            'city'           => $this->city,
            'timezone'       => $this->timezone ?? 'UTC',
            'language'       => $this->language ?? 'en',
            'email_notify'   => (bool) ($this->email_notify ?? true),
            'push_notify'    => (bool) ($this->push_notify ?? true),
            'sms_notify'     => (bool) ($this->sms_notify ?? false),
            'is_active'      => $this->is_active,
            'last_login_at'  => $this->last_login_at?->toIso8601String(),
            'roles'          => $this->whenLoaded('roles', fn() => $this->getRoleNames()),
            'permissions'    => $this->whenLoaded('permissions', fn() => $this->getAllPermissions()->pluck('name')),
            'company'        => $this->whenLoaded('company', fn() => [
                'id'       => $this->company?->id,
                'name'     => $this->company?->name,
                'logo'     => $this->formatMediaUrl($this->company?->logo),
                'address'  => $this->company?->address,
                'city'     => $this->company?->city,
                'province' => $this->company?->province,
                'country'  => $this->company?->country,
            ]),
            'branch'         => $this->whenLoaded('branch', fn() => [
                'id'       => $this->branch?->id,
                'name'     => $this->branch?->name,
                'address'  => $this->branch?->address,
            ]),
            'employee'       => $this->whenLoaded('employee', fn() => [
                'id'       => $this->employee?->id,
                'code'     => $this->employee?->code,
                'position' => $this->employee?->position?->name,
                'department' => $this->employee?->department?->name,
            ]),
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
