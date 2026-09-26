<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id'  => 'required|integer|exists:companies,id',
            'name'        => 'required|string|max:100',
            'slug'        => 'sometimes|nullable|string|max:100|unique:brands,slug',
            'description' => 'nullable|string',
            'logo'        => 'nullable',
            'logo_file'   => 'nullable|image|max:10240',
            'is_active'   => 'sometimes|boolean',
        ];
    }
}
