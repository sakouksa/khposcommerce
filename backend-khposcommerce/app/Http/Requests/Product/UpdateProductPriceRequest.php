<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductPriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id'         => ['sometimes', 'required', 'integer', 'exists:products,id'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'price_type'         => ['sometimes', 'required', 'string', 'max:255'],
            'min_qty'            => ['sometimes', 'integer', 'min:1'],
            'price'              => ['sometimes', 'required', 'numeric', 'min:0'],
            'currency_code'      => ['sometimes', 'string', 'max:10'],
            'start_date'         => ['nullable', 'date'],
            'end_date'           => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active'          => ['sometimes', 'boolean']
        ];
    }
}
