<?php

namespace App\Http\Resources\Employee;

use App\Format\GlobalFormat;
use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class EmployeeResource extends BaseJsonResource
{
    public function toArray(Request $request): array
    {
        $photoUrl = $this->formatMediaUrl($this->photo);

        return [
            'id'                     => $this->id,
            'company_id'             => $this->company_id,
            'branch_id'              => $this->branch_id,
            'department_id'          => $this->department_id,
            'position_id'            => $this->position_id,
            'reporting_to_id'        => $this->reporting_to_id,
            'user_id'                => $this->user_id,
            'employee_number'        => $this->employee_number,
            'name'                   => $this->name,
            'email'                  => GlobalFormat::email($this->email),
            'phone'                  => $this->phone ? GlobalFormat::phone($this->phone) : null,
            'phone_local'            => $this->phone ? GlobalFormat::phoneLocal($this->phone) : null,
            'nik'                    => $this->nik,
            'gender'                 => $this->gender,
            'birth_date'             => GlobalFormat::dateOnly($this->birth_date),
            'address'                => $this->address,
            'photo'                  => $photoUrl,
            'photo_url'              => $photoUrl,
            'join_date'              => GlobalFormat::dateOnly($this->join_date),
            'resign_date'            => GlobalFormat::dateOnly($this->resign_date),
            'contract_type'          => $this->contract_type ?? 'udc',
            'contract_end_date'      => GlobalFormat::dateOnly($this->contract_end_date),
            'status'                 => $this->status,
            'status_badge'           => GlobalFormat::statusBadge($this->status),
            'basic_salary'           => $this->basic_salary,
            'basic_salary_formatted' => $this->basic_salary ? GlobalFormat::money($this->basic_salary, 'USD') : null,
            // POS & Security
            'pos_pin'                => $this->pos_pin,
            'has_pos_pin'            => !empty($this->pos_pin),
            'card_uid'               => $this->card_uid,
            'sales_commission_rate'  => (float) ($this->sales_commission_rate ?? 0),
            'is_pos_supervisor'      => (bool) $this->is_pos_supervisor,
            'can_override_discount'  => (bool) $this->can_override_discount,
            'can_void_sale'          => (bool) $this->can_void_sale,
            // E-Commerce & Driver
            'is_driver'              => (bool) $this->is_driver,
            'driver_license_no'      => $this->driver_license_no,
            'vehicle_plate_no'       => $this->vehicle_plate_no,
            'driver_status'          => $this->driver_status ?? 'available',
            'is_fulfillment_picker'  => (bool) $this->is_fulfillment_picker,
            // Cambodia Bank & NSSF
            'bank_name'              => $this->bank_name,
            'bank_account_number'    => $this->bank_account_number,
            'bank_account_masked'    => $this->bank_account_number ? GlobalFormat::bankAccountMask($this->bank_account_number) : null,
            'bank_account_holder'    => $this->bank_account_holder,
            'nssf_number'            => $this->nssf_number,
            'has_nssf'               => (bool) $this->has_nssf,
            'dependents_count'       => (int) ($this->dependents_count ?? 0),
            // Relationships
            'company'                => $this->company,
            'branch'                 => $this->branch,
            'department'             => $this->department,
            'position'               => $this->position,
            'manager'                => $this->manager ? [
                'id'              => $this->manager->id,
                'name'            => $this->manager->name,
                'employee_number' => $this->manager->employee_number,
            ] : null,
            'user'                   => $this->user,
            'attendance_count'       => $this->attendances_count ?? $this->attendances()->count(),
            'payroll_count'          => $this->payrolls_count ?? $this->payrolls()->count(),
            'leave_requests_count'   => $this->leave_requests_count ?? $this->leaveRequests()->count(),
            'created_at'             => $this->created_at,
            'updated_at'             => $this->updated_at,
        ];
    }
}
