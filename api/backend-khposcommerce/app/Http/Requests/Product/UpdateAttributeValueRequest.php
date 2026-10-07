<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttributeValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attribute_id' => ['sometimes', 'required', 'integer', 'exists:attributes,id'],
            'value'        => ['sometimes', 'required', 'string', 'max:255'],
            'color_code'   => ['nullable', 'string', 'max:10'],
            'sort_order'   => ['sometimes', 'integer', 'min:0']
        ];
    }
}
