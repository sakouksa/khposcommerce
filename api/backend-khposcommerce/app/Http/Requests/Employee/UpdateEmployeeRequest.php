<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee');
        if (is_object($employeeId)) {
            $employeeId = $employeeId->id;
        }

        return [
            'company_id'            => ['required', 'integer', 'exists:companies,id'],
            'branch_id'             => ['required', 'integer', 'exists:branches,id'],
            'department_id'         => ['nullable', 'integer', 'exists:departments,id'],
            'position_id'           => ['nullable', 'integer', 'exists:positions,id'],
            'reporting_to_id'       => ['nullable', 'integer', 'exists:employees,id'],
            'user_id'               => ['nullable', 'integer', 'exists:users,id'],
            'employee_number'       => [
                'required',
                'string',
                'max:100',
                Rule::unique('employees')->ignore($employeeId)->whereNull('deleted_at')
            ],
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('employees')->ignore($employeeId)->whereNull('deleted_at')
            ],
            'phone'                 => ['nullable', 'string', 'max:50'],
            'nik'                   => ['nullable', 'string', 'max:50'],
            'gender'                => ['nullable', 'string', 'in:male,female,other'],
            'birth_date'            => ['nullable', 'date'],
            'address'               => ['nullable', 'string'],
            'photo'                 => ['nullable', 'string'],
            'join_date'             => ['nullable', 'date'],
            'resign_date'           => ['nullable', 'date'],
            'contract_type'         => ['nullable', 'string', 'in:probation,fdc,udc'],
            'contract_end_date'     => ['nullable', 'date'],
            'status'                => ['nullable', 'string', 'in:active,inactive,resigned'],
            'basic_salary'          => ['nullable', 'numeric', 'min:0'],
            // POS & Security
            'pos_pin'               => ['nullable', 'string', 'max:10'],
            'card_uid'              => ['nullable', 'string', 'max:100'],
            'sales_commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_pos_supervisor'     => ['nullable', 'boolean'],
            'can_override_discount' => ['nullable', 'boolean'],
            'can_void_sale'         => ['nullable', 'boolean'],
            // E-Commerce & Logistics
            'is_driver'             => ['nullable', 'boolean'],
            'driver_license_no'     => ['nullable', 'string', 'max:100'],
            'vehicle_plate_no'      => ['nullable', 'string', 'max:50'],
            'driver_status'         => ['nullable', 'string', 'in:available,delivering,off_duty'],
            'is_fulfillment_picker' => ['nullable', 'boolean'],
            // Cambodia Bank & NSSF
            'bank_name'             => ['nullable', 'string', 'max:100'],
            'bank_account_number'   => ['nullable', 'string', 'max:100'],
            'bank_account_holder'   => ['nullable', 'string', 'max:150'],
            'nssf_number'           => ['nullable', 'string', 'max:100'],
            'has_nssf'              => ['nullable', 'boolean'],
            'dependents_count'      => ['nullable', 'integer', 'min:0'],
        ];
    }
}
