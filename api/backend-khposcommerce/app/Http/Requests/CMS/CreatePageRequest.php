<?php

namespace App\Http\Requests\CMS;

use Illuminate\Foundation\Http\FormRequest;

class CreatePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'title' => ['string'],
            'slug' => ['string'],
            'content' => ['string'],
            'status' => ['string'],
            'meta_title' => ['string'],
            'meta_description' => ['string']
        ];
    }
}
