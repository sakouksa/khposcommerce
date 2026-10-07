<?php

namespace App\Http\Requests\POS;

use Illuminate\Foundation\Http\FormRequest;

class CreateCashRegisterTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cash_register_id' => ['integer', 'exists:cash_registers,id'],
            'user_id' => ['integer', 'exists:users,id'],
            'type' => ['string'],
            'amount' => ['numeric'],
            'balance_before' => ['numeric'],
            'balance_after' => ['numeric'],
            'reference_type' => ['string'],
            'reference_id' => ['integer', 'exists:references,id'],
            'notes' => ['string']
        ];
    }
}
