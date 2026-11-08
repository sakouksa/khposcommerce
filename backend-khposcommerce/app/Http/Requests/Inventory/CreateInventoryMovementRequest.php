<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class CreateInventoryMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'warehouse_id' => ['integer', 'exists:warehouses,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'user_id' => ['integer', 'exists:users,id'],
            'reference_type' => ['string'],
            'reference_id' => ['integer', 'exists:references,id'],
            'type' => ['string'],
            'quantity' => ['numeric'],
            'quantity_before' => ['numeric'],
            'quantity_after' => ['numeric'],
            'unit_cost' => ['numeric'],
            'notes' => ['string']
        ];
    }
}
