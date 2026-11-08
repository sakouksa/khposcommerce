<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id'                 => ['nullable', 'integer', 'exists:companies,id'],
            'purchase_id'                => ['required', 'integer', 'exists:purchases,id'],
            'supplier_id'                => ['nullable', 'integer', 'exists:suppliers,id'],
            'rma_number'                 => ['nullable', 'string', 'max:100'],
            'shipping_carrier'           => ['nullable', 'string', 'max:100'],
            'tracking_number'            => ['nullable', 'string', 'max:100'],
            'date'                       => ['required', 'date'],
            'reason'                     => ['required', 'string'],
            'status'                     => ['nullable', 'string', 'in:draft,approved,shipped,completed,cancelled'],
            'attachment_url'             => ['nullable', 'string'],
            'items'                      => ['required', 'array', 'min:1'],
            'items.*.purchase_item_id'   => ['required', 'integer', 'exists:purchase_items,id'],
            'items.*.product_id'         => ['required', 'integer', 'exists:products,id'],
            'items.*.product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.batch_number'       => ['nullable', 'string', 'max:100'],
            'items.*.serial_number'      => ['nullable', 'string', 'max:100'],
            'items.*.quantity'           => ['required', 'numeric', 'gt:0'],
            'items.*.unit_cost'          => ['required', 'numeric', 'gte:0'],
            'items.*.notes'              => ['nullable', 'string'],
        ];
    }
}
