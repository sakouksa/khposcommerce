<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSaleReturnItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sale_return_id' => ['integer', 'exists:sale_returns,id'],
            'sale_item_id' => ['integer', 'exists:sale_items,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'quantity' => ['numeric'],
            'unit_price' => ['numeric'],
            'total' => ['numeric'],
            'notes' => ['string']
        ];
    }
}
