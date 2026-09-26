<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brand = $this->route('brand');
        $id = is_object($brand) ? $brand->id : $brand;

        return [
            'name'        => 'sometimes|required|string|max:100',
            'slug'        => "sometimes|required|string|max:100|unique:brands,slug,{$id}",
            'description' => 'nullable|string',
            'logo'        => 'nullable',
            'logo_file'   => 'nullable|image|max:10240',
            'remove_logo' => 'nullable|boolean',
            'is_active'   => 'sometimes|boolean',
        ];
    }
}
