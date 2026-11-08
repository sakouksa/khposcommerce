<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'date'        => ['required', 'date'],
            'check_in'    => ['nullable', 'string'],
            'check_out'   => ['nullable', 'string'],
            'status'      => ['required', 'string', 'in:present,absent,late,leave,holiday'],
            'notes'       => ['nullable', 'string']
        ];
    }
}
