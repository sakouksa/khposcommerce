<?php

namespace App\Services\Employee;

use App\Repositories\Employee\LeaveRequestRepository;
use App\Models\Employee\LeaveRequest;
use App\Models\Employee\LeaveBalance;
use App\Models\Employee\Attendance;
use App\Models\Employee\Employee;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LeaveService
{
    public function __construct(private readonly LeaveRequestRepository $repository)
    {
    }

    public function getPaginated(int $perPage = 15, array $filters = [], string $sort = 'created_at', string $order = 'desc'): LengthAwarePaginator
    {
        return $this->repository->paginateWithFilters($filters, $perPage, $sort, $order);
    }

    public function getById(int|string $id): LeaveRequest
    {
        return $this->repository->findById($id, ['employee', 'approver', 'company', 'branch']);
    }

    public function create(array $data): LeaveRequest
    {
        $startDate = Carbon::parse($data['start_date']);
        $endDate = Carbon::parse($data['end_date']);
        
        if (!isset($data['total_days'])) {
            $data['total_days'] = $startDate->diffInDays($endDate) + 1;
        }

        $employee = Employee::find($data['employee_id']);
        if ($employee) {
            $data['company_id'] = $data['company_id'] ?? $employee->company_id;
            $data['branch_id'] = $data['branch_id'] ?? $employee->branch_id;
        }

        $data['status'] = $data['status'] ?? 'pending';

        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): LeaveRequest
    {
        return $this->repository->update($id, $data);
    }

    public function approve(int $id, int $approvedByUserId, ?string $managerNotes = null): LeaveRequest
    {
        return DB::transaction(function () use ($id, $approvedByUserId, $managerNotes) {
            $leave = $this->repository->findById($id);
            $leave->update([
                'status'        => 'approved',
                'approved_by'   => $approvedByUserId,
                'approved_at'   => now(),
                'manager_notes' => $managerNotes ?? $leave->manager_notes,
            ]);

            // Update Leave Balance
            $year = Carbon::parse($leave->start_date)->year;
            $balance = $this->repository->getBalance($leave->employee_id, $year);
            $days = (float) $leave->total_days;

            if ($leave->leave_type === 'annual') {
                $balance->increment('annual_leave_used', $days);
            } elseif ($leave->leave_type === 'sick') {
                $balance->increment('sick_leave_used', $days);
            } elseif ($leave->leave_type === 'special') {
                $balance->increment('special_leave_used', $days);
            } elseif ($leave->leave_type === 'maternity') {
                $balance->increment('maternity_leave_used', $days);
            }

            // Sync Attendance records for the leave period
            $employee = Employee::find($leave->employee_id);
            $period = CarbonPeriod::create($leave->start_date, $leave->end_date);

            foreach ($period as $date) {
                Attendance::updateOrCreate(
                    [
                        'employee_id' => $leave->employee_id,
                        'date'        => $date->format('Y-m-d'),
                    ],
                    [
                        'company_id'      => $employee?->company_id ?? 1,
                        'branch_id'       => $employee?->branch_id ?? 1,
                        'department_id'   => $employee?->department_id,
                        'position_id'     => $employee?->position_id,
                        'attendance_date' => $date->format('Y-m-d'),
                        'status'          => 'leave',
                        'notes'           => "Approved {$leave->leave_type} leave (Ref #{$leave->id})",
                        'is_manual'       => true,
                        'approved_by'     => $approvedByUserId,
                        'approved_at'     => now(),
                    ]
                );
            }

            return $leave->fresh(['employee', 'approver', 'company', 'branch']);
        });
    }

    public function reject(int $id, int $rejectedByUserId, ?string $managerNotes = null): LeaveRequest
    {
        $leave = $this->repository->findById($id);
        $leave->update([
            'status'        => 'rejected',
            'approved_by'   => $rejectedByUserId,
            'approved_at'   => now(),
            'manager_notes' => $managerNotes,
        ]);

        return $leave->fresh(['employee', 'approver']);
    }

    public function getBalance(int $employeeId, ?int $year = null): LeaveBalance
    {
        $year = $year ?? now()->year;
        return $this->repository->getBalance($employeeId, $year);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function bulkDelete(array $ids): int
    {
        return $this->repository->bulkDelete($ids);
    }
}
