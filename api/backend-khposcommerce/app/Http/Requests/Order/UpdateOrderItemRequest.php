<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['integer', 'exists:orders,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'product_name' => ['string'],
            'product_sku' => ['string'],
            'product_image' => ['string'],
            'quantity' => ['numeric'],
            'unit_price' => ['numeric'],
            'discount_amount' => ['numeric'],
            'tax_amount' => ['numeric'],
            'subtotal' => ['numeric'],
            'total' => ['numeric']
        ];
    }
}
