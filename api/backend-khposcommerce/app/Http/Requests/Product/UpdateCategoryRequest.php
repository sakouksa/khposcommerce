<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category = $this->route('category');
        $id = is_object($category) ? $category->id : $category;

        return [
            'parent_id'   => 'nullable|integer|exists:categories,id',
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => "sometimes|required|string|max:255|unique:categories,slug,{$id}",
            'description' => 'nullable|string',
            'image'        => 'nullable',
            'image_file'   => 'nullable|image|max:10240',
            'remove_image' => 'nullable|boolean',
            'sort_order'   => 'sometimes|integer|min:0',
            'is_active'   => 'sometimes|boolean',
        ];
    }
}
