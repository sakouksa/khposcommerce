<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;

class CreatePurchaseItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'purchase_id' => ['integer', 'exists:purchases,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'quantity' => ['numeric'],
            'quantity_received' => ['numeric'],
            'unit_cost' => ['numeric'],
            'discount_percent' => ['numeric'],
            'discount_amount' => ['numeric'],
            'tax_percent' => ['numeric'],
            'tax_amount' => ['numeric'],
            'subtotal' => ['numeric'],
            'total' => ['numeric'],
            'notes' => ['string']
        ];
    }
}
