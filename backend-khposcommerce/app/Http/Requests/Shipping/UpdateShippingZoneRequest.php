<?php

namespace App\Http\Requests\Shipping;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShippingZoneRequest extends FormRequest
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
            'countries' => ['string'],
            'provinces' => ['string'],
            'cities' => ['string']
        ];
    }
}
