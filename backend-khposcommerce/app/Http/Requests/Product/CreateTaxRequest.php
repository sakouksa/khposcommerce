<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class CreateTaxRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (!$this->filled('company_id')) {
            $this->merge(['company_id' => $this->user()?->company_id ?? 1]);
        }
    }

    public function rules(): array
    {
        return [
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'name'       => ['required', 'string', 'max:255'],
            'rate'       => ['required', 'numeric', 'min:0', 'max:9999.9999'],
            'type'       => ['sometimes', 'required', 'string', 'in:percentage,fixed'],
            'is_active'  => ['sometimes', 'boolean']
        ];
    }
}
