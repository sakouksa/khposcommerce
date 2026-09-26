<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date'             => ['sometimes', 'required', 'date'],
            'due_date'         => ['nullable', 'date', 'after_or_equal:date'],
            'shipping_cost'    => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'paid_amount'      => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'notes'            => ['nullable', 'string'],
            'currency_code'    => ['sometimes', 'required', 'string', 'in:USD,KHR'],
            'exchange_rate'    => ['sometimes', 'required', 'numeric', 'gt:0'],
            'status'           => ['sometimes', 'required', 'string', 'in:draft,ordered,cancelled,received'],
            'items'            => ['sometimes', 'required', 'array', 'min:1'],
            'items.*.id'                 => ['nullable', 'integer', 'exists:purchase_items,id'],
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
