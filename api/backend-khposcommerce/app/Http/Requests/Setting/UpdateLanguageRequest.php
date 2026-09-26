<?php

namespace App\Http\Requests\Setting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLanguageRequest extends FormRequest
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
            'flag' => ['string'],
            'direction' => ['string'],
            'is_default' => ['boolean'],
            'is_active' => ['boolean']
        ];
    }
}
