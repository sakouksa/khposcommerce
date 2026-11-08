<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class CreateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id'  => ['required', 'integer', 'exists:companies,id'],
            'name'        => ['required', 'string', 'max:255'],
            'symbol'      => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['sometimes', 'boolean']
        ];
    }
}
