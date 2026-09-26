<?php

namespace App\Http\Requests\Setting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'province_id' => ['integer', 'exists:provinces,id'],
            'name' => ['string'],
            'type' => ['string'],
            'postal_code' => ['string']
        ];
    }
}
