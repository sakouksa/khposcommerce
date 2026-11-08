<?php

namespace App\Http\Requests\Marketing;

use Illuminate\Foundation\Http\FormRequest;

class CreatePromotionRequest extends FormRequest
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
            'description' => ['string'],
            'type' => ['string'],
            'conditions' => ['string'],
            'rewards' => ['string'],
            'starts_at' => ['string'],
            'ends_at' => ['string'],
            'priority' => ['integer'],
            'is_active' => ['boolean']
        ];
    }
}
