<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'payment_id' => ['sometimes', 'nullable', 'integer', 'exists:payments,id'],
            'type' => ['sometimes', 'string', 'in:debit,credit'],
            'amount' => ['sometimes', 'numeric'],
            'description' => ['sometimes', 'nullable', 'string'],
            'reference_type' => ['sometimes', 'nullable', 'string'],
            'reference_id' => ['sometimes', 'nullable', 'integer']
        ];
    }
}
