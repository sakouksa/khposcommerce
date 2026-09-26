<?php

namespace App\Http\Requests\CMS;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFaqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'question' => ['string'],
            'answer' => ['string'],
            'category' => ['string'],
            'sort_order' => ['integer'],
            'is_active' => ['boolean']
        ];
    }
}
