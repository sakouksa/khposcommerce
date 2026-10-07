<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStockOpnameItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock_opname_id' => ['integer', 'exists:stock_opnames,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'system_quantity' => ['numeric'],
            'physical_quantity' => ['numeric'],
            'difference' => ['numeric'],
            'notes' => ['string']
        ];
    }
}
