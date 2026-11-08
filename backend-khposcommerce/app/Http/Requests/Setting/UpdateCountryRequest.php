<?php

namespace App\Http\Requests\Setting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['string'],
            'code' => ['string'],
            'phone_code' => ['string'],
            'is_active' => ['boolean']
        ];
    }
}
