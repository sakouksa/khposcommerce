<?php

namespace App\Http\Requests\POS;

use Illuminate\Foundation\Http\FormRequest;

class CreateCashRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'branch_id' => ['integer', 'exists:branches,id'],
            'store_id' => ['integer', 'exists:stores,id'],
            'name' => ['string'],
            'code' => ['string'],
            'is_active' => ['boolean']
        ];
    }
}
