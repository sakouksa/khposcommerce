<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class CreateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (!$this->filled('company_id')) {
            $this->merge(['company_id' => $this->user()?->company_id ?? 1]);
        }
    }

    public function rules(): array
    {
        return [
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'payment_id' => ['nullable', 'integer', 'exists:payments,id'],
            'type' => ['required', 'string', 'in:debit,credit'],
            'amount' => ['required', 'numeric'],
            'description' => ['nullable', 'string'],
            'reference_type' => ['nullable', 'string'],
            'reference_id' => ['nullable', 'integer']
        ];
    }
}
