<?php

namespace App\Repositories\Employee;

use App\Repositories\BaseRepository;
use App\Models\Employee\Employee;

class EmployeeRepository extends BaseRepository
{
    public function __construct(Employee $model)
    {
        parent::__construct($model);
    }

    public function paginateWithFilters(
        array $filters = [],
        int $perPage = 10,
        string $sort = 'created_at',
        string $order = 'desc'
    ): \Illuminate\Pagination\LengthAwarePaginator {
        $query = $this->model
            ->with([
                'company:id,name',
                'branch:id,name',
                'department:id,name',
                'position:id,name',
                'manager:id,name,employee_number',
                'user:id,name,email',
            ])
            ->withCount(['attendances', 'payrolls', 'leaveRequests'])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('employee_number', 'like', "%{$search}%")
                       ->orWhere('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%")
                       ->orWhere('phone', 'like', "%{$search}%")
                       ->orWhere('nik', 'like', "%{$search}%")
                       ->orWhere('pos_pin', 'like', "%{$search}%")
                       ->orWhere('card_uid', 'like', "%{$search}%")
                       ->orWhere('bank_account_number', 'like', "%{$search}%")
                       ->orWhereHas('department', function ($dq) use ($search) {
                           $dq->where('name', 'like', "%{$search}%");
                       })
                       ->orWhereHas('position', function ($pq) use ($search) {
                           $pq->where('name', 'like', "%{$search}%");
                       });
                });
            })
            ->when($filters['company_id'] ?? null, fn($q, $v) => $q->where('company_id', $v))
            ->when($filters['branch_id'] ?? null, fn($q, $v) => $q->where('branch_id', $v))
            ->when($filters['department_id'] ?? null, fn($q, $v) => $q->where('department_id', $v))
            ->when($filters['position_id'] ?? null, fn($q, $v) => $q->where('position_id', $v))
            ->when($filters['reporting_to_id'] ?? null, fn($q, $v) => $q->where('reporting_to_id', $v))
            ->when($filters['gender'] ?? null, fn($q, $v) => $q->where('gender', $v))
            ->when($filters['contract_type'] ?? null, fn($q, $v) => $q->where('contract_type', $v))
            ->when(isset($filters['is_driver']) && $filters['is_driver'] !== '', fn($q) => $q->where('is_driver', filter_var($filters['is_driver'], FILTER_VALIDATE_BOOLEAN)))
            ->when(isset($filters['is_pos_supervisor']) && $filters['is_pos_supervisor'] !== '', fn($q) => $q->where('is_pos_supervisor', filter_var($filters['is_pos_supervisor'], FILTER_VALIDATE_BOOLEAN)))
            ->when(isset($filters['is_fulfillment_picker']) && $filters['is_fulfillment_picker'] !== '', fn($q) => $q->where('is_fulfillment_picker', filter_var($filters['is_fulfillment_picker'], FILTER_VALIDATE_BOOLEAN)))
            ->when($filters['driver_status'] ?? null, fn($q, $v) => $q->where('driver_status', $v))
            ->when($filters['status'] ?? null, function ($q, $status) {
                if ($status === 'deleted') {
                    $q->onlyTrashed();
                } else {
                    $q->where('status', $status);
                }
            })
            ->when($filters['join_date_start'] ?? null, fn($q, $v) => $q->where('join_date', '>=', $v))
            ->when($filters['join_date_end'] ?? null, fn($q, $v) => $q->where('join_date', '<=', $v))
            ->when($filters['created_date_start'] ?? null, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['created_date_end'] ?? null, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($filters['salary_min'] ?? null, fn($q, $v) => $q->where('basic_salary', '>=', $v))
            ->when($filters['salary_max'] ?? null, fn($q, $v) => $q->where('basic_salary', '<=', $v));

        $allowedSorts = ['employee_number', 'name', 'email', 'phone', 'basic_salary', 'join_date', 'created_at', 'status', 'sales_commission_rate'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'created_at';

        return $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc')
                     ->paginate($perPage);
    }
}
