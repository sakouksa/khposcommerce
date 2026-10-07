<?php

namespace App\Http\Requests\CMS;

use Illuminate\Foundation\Http\FormRequest;

class CreateBlogTagRequest extends FormRequest
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
            'slug' => ['string']
        ];
    }
}
