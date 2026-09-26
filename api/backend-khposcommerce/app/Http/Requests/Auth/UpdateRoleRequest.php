<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('role.update') ?? false;
    }

    public function rules(): array
    {
        $roleId = $this->route('role') ?? $this->route('id');

        return [
            'name'          => 'sometimes|string|max:100|unique:roles,name,' . $roleId,
            'guard_name'    => 'sometimes|string|max:50',
            'permissions'   => 'sometimes|array',
            'permissions.*' => 'string|exists:permissions,name',
        ];
    }
}
