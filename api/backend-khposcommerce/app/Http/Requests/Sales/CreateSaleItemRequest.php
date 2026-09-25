<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class CreateSaleItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sale_id' => ['integer', 'exists:sales,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'product_name' => ['string'],
            'sku' => ['string'],
            'quantity' => ['numeric'],
            'unit_price' => ['numeric'],
            'discount_percent' => ['numeric'],
            'discount_amount' => ['numeric'],
            'tax_percent' => ['numeric'],
            'tax_amount' => ['numeric'],
            'subtotal' => ['numeric'],
            'total' => ['numeric']
        ];
    }
}
