<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSaleReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'sale_id' => ['integer', 'exists:sales,id'],
            'user_id' => ['integer', 'exists:users,id'],
            'reference_number' => ['string'],
            'date' => ['string'],
            'total_amount' => ['numeric'],
            'refund_amount' => ['numeric'],
            'refund_method' => ['string'],
            'reason' => ['string'],
            'status' => ['string']
        ];
    }
}
