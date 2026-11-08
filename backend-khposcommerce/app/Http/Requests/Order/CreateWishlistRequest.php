<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CreateWishlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['integer', 'exists:customers,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id']
        ];
    }
}
