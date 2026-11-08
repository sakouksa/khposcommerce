<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class CreateStockTransferItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock_transfer_id' => ['integer', 'exists:stock_transfers,id'],
            'product_id' => ['integer', 'exists:products,id'],
            'product_variant_id' => ['integer', 'exists:product_variants,id'],
            'quantity_requested' => ['numeric'],
            'quantity_sent' => ['numeric'],
            'quantity_received' => ['numeric'],
            'notes' => ['string']
        ];
    }
}
