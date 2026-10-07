<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStockAdjustmentItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock_adjustment_id' => ['integer', 'exists:stock_adjustments,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'quantity_before' => ['numeric'],
            'quantity_adjusted' => ['numeric'],
            'quantity_after' => ['numeric'],
            'notes' => ['string']
        ];
    }
}
