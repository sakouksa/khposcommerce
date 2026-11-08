<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('permission.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:100|unique:permissions,name|regex:/^[a-z0-9_]+\.[a-z0-9_]+$/',
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
