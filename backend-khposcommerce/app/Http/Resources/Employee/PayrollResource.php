<?php

namespace App\Http\Resources\Employee;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $grossSalary = (float) $this->basic_salary + (float) $this->allowances + (float) $this->overtime_pay + (float) $this->sales_commission + (float) $this->seniority_pay;
        $totalDeductions = (float) $this->deductions + (float) $this->nssf_deduction + (float) $this->tax_deduction;
        $netSalary = (float) $this->net_salary;

        return [
            'id'                    => $this->id,
            'employee_id'           => $this->employee_id,
            'period_month'          => $this->period_month,
            'working_days'          => (int) $this->working_days,
            'present_days'          => (int) $this->present_days,
            'basic_salary'          => (float) $this->basic_salary,
            'allowances'            => (float) $this->allowances,
            'overtime_pay'          => (float) $this->overtime_pay,
            'sales_commission'      => (float) $this->sales_commission,
            'seniority_pay'         => (float) $this->seniority_pay,
            'gross_salary'          => $grossSalary,
            'deductions'            => (float) $this->deductions,
            'nssf_deduction'        => (float) $this->nssf_deduction,
            'tax_deduction'         => (float) $this->tax_deduction,
            'total_deductions'      => $totalDeductions,
            'net_salary'            => $netSalary,
            'status'                => $this->status,
            'payment_method'        => $this->payment_method ?? 'bank_transfer',
            'bank_account_snapshot' => $this->bank_account_snapshot,
            'paid_at'               => $this->paid_at?->format('Y-m-d'),
            'notes'                 => $this->notes,
            'employee'              => $this->employee ? [
                'id'              => $this->employee->id,
                'name'            => $this->employee->name,
                'employee_number' => $this->employee->employee_number,
                'email'           => $this->employee->email,
                'phone'           => $this->employee->phone,
                'photo'           => $this->employee->photo,
                'department'      => $this->employee->department?->name,
                'position'        => $this->employee->position?->name,
                'branch'          => $this->employee->branch?->name,
                'bank_name'       => $this->employee->bank_name,
                'bank_account_number' => $this->employee->bank_account_number,
                'bank_account_holder' => $this->employee->bank_account_holder,
            ] : null,
            'created_at'            => $this->created_at,
            'updated_at'            => $this->updated_at,
        ];
    }
}
