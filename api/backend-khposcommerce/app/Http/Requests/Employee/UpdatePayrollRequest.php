<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePayrollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id'  => ['required', 'integer', 'exists:employees,id'],
            'period_month' => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'working_days' => ['required', 'integer', 'min:0'],
            'present_days' => ['required', 'integer', 'min:0'],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'allowances'   => ['nullable', 'numeric', 'min:0'],
            'deductions'   => ['nullable', 'numeric', 'min:0'],
            'overtime_pay' => ['nullable', 'numeric', 'min:0'],
            'net_salary'   => ['required', 'numeric', 'min:0'],
            'status'       => ['required', 'string', 'in:draft,approved,paid'],
            'paid_at'      => ['nullable', 'date'],
            'notes'        => ['nullable', 'string']
        ];
    }
}
