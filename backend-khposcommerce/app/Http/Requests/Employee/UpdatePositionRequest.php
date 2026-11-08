<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id'    => ['required', 'integer', 'exists:companies,id'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'name'          => ['required', 'string', 'max:255'],
            'code'          => ['nullable', 'string', 'max:50'],
            'description'   => ['nullable', 'string'],
            'is_active'     => ['boolean']
        ];
    }
}
