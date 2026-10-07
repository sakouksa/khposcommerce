<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;

class CreatePurchaseReturnItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'purchase_return_id' => ['integer', 'exists:purchase_returns,id'],
            'purchase_item_id' => ['integer', 'exists:purchase_items,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'quantity' => ['numeric'],
            'unit_cost' => ['numeric'],
            'total' => ['numeric'],
            'notes' => ['string']
        ];
    }
}
