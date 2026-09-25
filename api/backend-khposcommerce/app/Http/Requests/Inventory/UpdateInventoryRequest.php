<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryRequest extends FormRequest
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
            'quantity' => ['numeric'],
            'reserved_quantity' => ['numeric'],
            'available_quantity' => ['numeric'],
            'reorder_point' => ['numeric'],
            'reorder_qty' => ['numeric']
        ];
    }
}
