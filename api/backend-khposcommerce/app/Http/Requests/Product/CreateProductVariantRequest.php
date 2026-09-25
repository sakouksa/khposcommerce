<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id'       => ['required', 'integer', 'exists:products,id'],
            'name'             => ['required', 'string', 'max:255'],
            'sku'              => ['sometimes', 'nullable', 'string', 'max:255', 'unique:product_variants,sku'],
            'barcode'          => ['nullable', 'string', 'max:255', 'unique:product_variants,barcode'],
            'cost_price'       => ['nullable', 'numeric', 'min:0'],
            'selling_price'    => ['required', 'numeric', 'min:0'],
            'compare_price'    => ['nullable', 'numeric', 'min:0'],
            'weight'           => ['nullable', 'numeric', 'min:0'],
            'stock'            => ['nullable', 'numeric', 'min:0'],
            'quantity'         => ['nullable', 'numeric', 'min:0'],
            'image'            => ['nullable', 'string'],
            'is_active'        => ['sometimes', 'boolean'],
            'attribute_values' => ['nullable', 'array'],
            'attribute_values.*' => ['integer', 'exists:attribute_values,id'],
        ];
    }
}
