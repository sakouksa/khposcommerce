<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['integer', 'exists:suppliers,id'],
            'name' => ['string'],
            'title' => ['string'],
            'email' => ['string'],
            'phone' => ['string'],
            'is_primary' => ['boolean']
        ];
    }
}
