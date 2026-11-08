<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('permission.update') ?? false;
    }

    public function rules(): array
    {
        $permissionId = $this->route('permission') ?? $this->route('id');

        return [
            'name'       => 'sometimes|string|max:100|regex:/^[a-z0-9_]+\.[a-z0-9_]+$/|unique:permissions,name,' . $permissionId,
            'guard_name' => 'sometimes|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'Permission name must follow the standard {module}.{action} convention (e.g. product.view).',
        ];
    }
}
