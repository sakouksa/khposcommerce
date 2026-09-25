<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;

class CreatePurchaseReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'purchase_id' => ['integer', 'exists:purchases,id'],
            'supplier_id' => ['integer', 'exists:suppliers,id'],
            'user_id' => ['integer', 'exists:users,id'],
            'reference_number' => ['string'],
            'date' => ['string'],
            'total_amount' => ['numeric'],
            'reason' => ['string'],
            'status' => ['string']
        ];
    }
}
