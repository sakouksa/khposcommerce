<?php

namespace App\Http\Resources\Employee;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'company_id'     => $this->company_id,
            'branch_id'      => $this->branch_id,
            'employee_id'    => $this->employee_id,
            'leave_type'     => $this->leave_type,
            'start_date'     => $this->start_date?->format('Y-m-d'),
            'end_date'       => $this->end_date?->format('Y-m-d'),
            'total_days'     => (float) $this->total_days,
            'reason'         => $this->reason,
            'status'         => $this->status,
            'approved_by'    => $this->approved_by,
            'approved_at'    => $this->approved_at?->format('Y-m-d H:i:s'),
            'manager_notes'  => $this->manager_notes,
            'attachments'    => $this->attachments,
            'employee'       => $this->employee ? [
                'id'              => $this->employee->id,
                'name'            => $this->employee->name,
                'employee_number' => $this->employee->employee_number,
                'photo'           => $this->employee->photo,
                'department'      => $this->employee->department?->name,
                'position'        => $this->employee->position?->name,
            ] : null,
            'approver'       => $this->approver ? [
                'id'   => $this->approver->id,
                'name' => $this->approver->name,
            ] : null,
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
        ];
    }
}
