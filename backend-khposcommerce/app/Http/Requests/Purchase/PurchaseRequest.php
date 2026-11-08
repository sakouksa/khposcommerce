<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id'       => ['required', 'integer', 'exists:companies,id'],
            'branch_id'        => ['required', 'integer', 'exists:branches,id'],
            'warehouse_id'     => ['required', 'integer', 'exists:warehouses,id'],
            'supplier_id'      => ['required', 'integer', 'exists:suppliers,id'],
            'date'             => ['required', 'date'],
            'due_date'         => ['nullable', 'date', 'after_or_equal:date'],
            'shipping_cost'    => ['nullable', 'numeric', 'min:0'],
            'paid_amount'      => ['nullable', 'numeric', 'min:0'],
            'notes'            => ['nullable', 'string'],
            'currency_code'    => ['required', 'string', 'in:USD,KHR'],
            'exchange_rate'    => ['required', 'numeric', 'gt:0'],
            'items'            => ['required', 'array', 'min:1'],
            'items.*.product_id'         => ['required', 'integer', 'exists:products,id'],
            'items.*.product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.quantity'           => ['required', 'numeric', 'gt:0'],
            'items.*.unit_cost'          => ['required', 'numeric', 'min:0'],
            'items.*.discount_percent'   => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.tax_percent'        => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.notes'              => ['nullable', 'string'],
        ];
    }
}
