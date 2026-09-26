<?php

namespace App\Http\Requests\Shipping;

use Illuminate\Foundation\Http\FormRequest;

class CreateShippingMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'name' => ['string'],
            'code' => ['string'],
            'provider' => ['string'],
            'base_price' => ['numeric'],
            'is_active' => ['boolean']
        ];
    }
}
