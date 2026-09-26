<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'symbol'      => ['sometimes', 'required', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['sometimes', 'boolean']
        ];
    }
}
