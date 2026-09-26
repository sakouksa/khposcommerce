<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductVariantValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_variant_id' => ['sometimes', 'required', 'integer', 'exists:product_variants,id'],
            'attribute_id'         => ['sometimes', 'required', 'integer', 'exists:attributes,id'],
            'attribute_value_id' => ['sometimes', 'required', 'integer', 'exists:attribute_values,id']
        ];
    }
}
