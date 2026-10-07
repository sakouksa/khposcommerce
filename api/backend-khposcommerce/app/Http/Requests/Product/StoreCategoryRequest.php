<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id'  => 'required|integer|exists:companies,id',
            'parent_id'   => 'nullable|integer|exists:categories,id',
            'name'        => 'required|string|max:255',
            'slug'        => 'sometimes|nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'image'       => 'nullable',
            'image_file'  => 'nullable|image|max:10240',
            'sort_order'  => 'sometimes|integer|min:0',
            'is_active'   => 'sometimes|boolean',
        ];
    }
}
